import {
	RaceModeEnum,
	RoomStatusEnum,
	type SocketAction,
	SocketActionEnum,
	SocketEventEnum,
} from '@qwertix/room-contracts';
import type { FastifyInstance } from 'fastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SocketManager } from '../../src/managers/SocketManager';
import { MemoryRoomRepository } from '../../src/repositories/MemoryRoomRepository';
import { ResultService } from '../../src/services/ResultService';
import { RoomService } from '../../src/services/RoomService';
import { WordService } from '../../src/services/WordService';
import { FakeLogger } from '../fakes/FakeLogger';
import { FakeResultRepository } from '../fakes/FakeResultRepository';
import { FakeWebSocket, FakeWebSocketServer } from '../fakes/FakeWebSocket';

describe('SocketManager Integration', () => {
	let wss: FakeWebSocketServer;
	let roomService: RoomService;
	let resultService: ResultService;
	let roomRepo: MemoryRoomRepository;
	let resultRepo: FakeResultRepository;
	let logger: FakeLogger;
	let app: Partial<FastifyInstance>;

	beforeEach(() => {
		wss = new FakeWebSocketServer();
		roomRepo = new MemoryRoomRepository();
		resultRepo = new FakeResultRepository();
		logger = new FakeLogger();

		const wordService = new WordService();
		roomService = new RoomService(roomRepo, wordService);
		resultService = new ResultService(resultRepo);

		app = {
			jwt: {
				verify: vi.fn().mockReturnValue({ id: 123 }),
				sign: vi.fn(),
			},
		} as unknown as FastifyInstance;

		new SocketManager(
			wss,
			roomService,
			logger,
			resultService,
			app as FastifyInstance,
		);
	});

	const connectClient = () => {
		const ws = new FakeWebSocket();
		wss.handleConnection(ws);
		return ws;
	};

	const sendMessage = (
		ws: FakeWebSocket,
		type: SocketActionEnum,
		payload: SocketAction['payload'],
	) => {
		ws.emit('message', JSON.stringify({ type, payload }));
	};

	describe('JOIN_ROOM', () => {
		it('should create room and join user', async () => {
			const room = await roomService.createRoom({
				mode: RaceModeEnum.WORDS,
				wordCount: 10,
			});
			const ws = connectClient();

			sendMessage(ws, SocketActionEnum.JOIN_ROOM, {
				roomId: room.id(),
				username: 'User1',
			});

			// Wait a tick for async handlers
			await new Promise(process.nextTick);

			expect(ws.roomId).toBe(room.id());
			expect(ws.username).toBe('User1');

			// Check that ROOM_STATE was sent at some point
			const roomStateMsg = ws.sentMessages.find((m) =>
				m.includes(SocketEventEnum.ROOM_STATE),
			);
			expect(roomStateMsg).toBeDefined();

			const participant = room.participants().get(ws.userId!);
			expect(participant).toBeDefined();
			expect(participant?.username).toBe('User1');
		});

		it('should fail if room does not exist', async () => {
			const ws = connectClient();
			sendMessage(ws, SocketActionEnum.JOIN_ROOM, {
				roomId: 'INVALID',
				username: 'User1',
			});
			await new Promise(process.nextTick);

			const lastMsg = ws.sentMessages[ws.sentMessages.length - 1];
			expect(lastMsg).toContain(SocketEventEnum.ERROR);
		});

		it('should authenticate with token', async () => {
			const room = await roomService.createRoom();
			const ws = connectClient();

			sendMessage(ws, SocketActionEnum.JOIN_ROOM, {
				roomId: room.id(),
				username: 'User1',
				token: 'valid_token',
			});
			await new Promise(process.nextTick);

			expect(ws.dbUserId).toBe(123); // From mock jwt
		});
	});

	describe('Game Flow', () => {
		it('should run a full race', async () => {
			const room = await roomService.createRoom({
				mode: RaceModeEnum.WORDS,
				wordCount: 5,
			});
			const ws = connectClient();

			// Join
			sendMessage(ws, SocketActionEnum.JOIN_ROOM, {
				roomId: room.id(),
				username: 'Host',
			});
			await new Promise(process.nextTick);

			// Start Race
			vi.useFakeTimers();
			vi.setSystemTime(10000); // Start at t=10000 to avoid Date.now()=0 issues

			sendMessage(ws, SocketActionEnum.START_RACE, {});
			await new Promise(process.nextTick);

			expect(room.status()).toBe(RoomStatusEnum.COUNTDOWN);
			vi.advanceTimersByTime(3000); // Countdown
			expect(room.status()).toBe(RoomStatusEnum.RACING);

			// Update Progress (send substantial amount to ensure > 0 progress)
			sendMessage(ws, SocketActionEnum.UPDATE_PROGRESS, { typedLength: 10 });
			await new Promise(process.nextTick);

			const p = room.participants().get(ws.userId!);
			expect(p?.stats().progress).toBeGreaterThan(0);

			// Finish
			const totalLen = room.text().join(' ').length;
			sendMessage(ws, SocketActionEnum.UPDATE_PROGRESS, {
				typedLength: totalLen,
			});
			await new Promise(process.nextTick);

			expect(room.status()).toBe(RoomStatusEnum.FINISHED);

			vi.useRealTimers();
		});
	});

	describe('SUBMIT_RESULT', () => {
		it('should save result to repo', async () => {
			const room = await roomService.createRoom();
			const ws = connectClient();

			sendMessage(ws, SocketActionEnum.JOIN_ROOM, {
				roomId: room.id(),
				username: 'User1',
				token: 'valid', // Authenticated
			});
			await new Promise(process.nextTick);

			// Need to START RACE for stats to be calculated
			vi.useFakeTimers();
			sendMessage(ws, SocketActionEnum.START_RACE, {});
			await new Promise(process.nextTick);
			vi.advanceTimersByTime(3000); // Countdown
			expect(room.status()).toBe(RoomStatusEnum.RACING);

			// Simulate typing time
			vi.advanceTimersByTime(1000); // 1 second

			// Submit result with replay data so WPM is calculated
			const replayData = [
				{ key: 'a', timestamp: Date.now() - 900 },
				{ key: 'b', timestamp: Date.now() - 800 },
				{ key: 'c', timestamp: Date.now() - 700 },
				{ key: 'd', timestamp: Date.now() - 600 },
				{ key: 'e', timestamp: Date.now() - 500 }, // 5 chars = 1 word
			];
			// 1 word in 1 second = 60 WPM.

			sendMessage(ws, SocketActionEnum.SUBMIT_RESULT, {
				wpm: 60, // Ignored by server
				raw: 60,
				accuracy: 100,
				consistency: 90,
				replayData: replayData,
			});
			await new Promise(process.nextTick);

			const results = await resultRepo.findByUserId(123);
			expect(results).toHaveLength(1);
			expect(results[0].wpm).toBeGreaterThan(0);

			vi.useRealTimers();
		});
	});

	describe('Reconnection & Lifecycle', () => {
		it('should reuse existing session when re-joining same room', async () => {
			const room = await roomService.createRoom();
			const ws = connectClient();

			// Join first time
			sendMessage(ws, SocketActionEnum.JOIN_ROOM, {
				roomId: room.id(),
				username: 'Reconnector',
			});
			await new Promise(process.nextTick);
			const firstUserId = ws.userId;
			expect(room.participants().size).toBe(1);

			// Re-join (same socket, same room, same name)
			sendMessage(ws, SocketActionEnum.JOIN_ROOM, {
				roomId: room.id(),
				username: 'Reconnector',
			});
			await new Promise(process.nextTick);

			expect(ws.userId).toBe(firstUserId);
			expect(room.participants().size).toBe(1); // No duplicates
		});

		it('should cleanup previous session when joining a different room', async () => {
			const room1 = await roomService.createRoom();
			const room2 = await roomService.createRoom();
			const ws = connectClient();

			// Join room 1
			sendMessage(ws, SocketActionEnum.JOIN_ROOM, {
				roomId: room1.id(),
				username: 'SwitchUser',
			});
			await new Promise(process.nextTick);
			expect(room1.participants().size).toBe(1);

			// Join room 2
			sendMessage(ws, SocketActionEnum.JOIN_ROOM, {
				roomId: room2.id(),
				username: 'SwitchUser',
			});
			await new Promise(process.nextTick);

			expect(room1.participants().size).toBe(0);
			expect(room2.participants().size).toBe(1);
		});

		it('should keep room alive during grace period and delete after timeout', async () => {
			vi.useFakeTimers();
			const room = await roomService.createRoom();
			const ws = connectClient();

			// Join
			sendMessage(ws, SocketActionEnum.JOIN_ROOM, {
				roomId: room.id(),
				username: 'Leaver',
			});
			await new Promise(process.nextTick);
			expect(room.participants().size).toBe(1);

			// Leave
			sendMessage(ws, SocketActionEnum.LEAVE_ROOM, {});
			await new Promise(process.nextTick);

			expect(room.participants().size).toBe(0);

			// Room should still be in repo (grace period)
			let found = await roomRepo.findById(room.id());
			expect(found).toBeDefined();

			// Advance time by 5s (halfway)
			vi.advanceTimersByTime(5000);
			found = await roomRepo.findById(room.id());
			expect(found).toBeDefined();

			// Advance time past 10s
			vi.advanceTimersByTime(6000);
			found = await roomRepo.findById(room.id());
			expect(found).toBeUndefined(); // Deleted

			vi.useRealTimers();
		});

		it('should cancel deletion if someone rejoins during grace period', async () => {
			vi.useFakeTimers();
			const room = await roomService.createRoom();
			const ws1 = connectClient();
			const ws2 = connectClient();

			// User 1 joins and leaves
			sendMessage(ws1, SocketActionEnum.JOIN_ROOM, {
				roomId: room.id(),
				username: 'User1',
			});
			await new Promise(process.nextTick);
			sendMessage(ws1, SocketActionEnum.LEAVE_ROOM, {});
			await new Promise(process.nextTick);

			// Advance 5s
			vi.advanceTimersByTime(5000);

			// User 2 joins
			sendMessage(ws2, SocketActionEnum.JOIN_ROOM, {
				roomId: room.id(),
				username: 'User2',
			});
			await new Promise(process.nextTick);

			// Advance another 10s (past original timeout)
			vi.advanceTimersByTime(10000);

			// Room should STILL be alive
			const found = await roomRepo.findById(room.id());
			expect(found).toBeDefined();
			expect(found?.participants().size).toBe(1);

			vi.useRealTimers();
		});
	});
});
