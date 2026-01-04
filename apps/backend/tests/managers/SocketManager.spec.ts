import type { SocketAction } from '@qwertix/room-contracts';
import { RaceModeEnum, RoomStatusEnum } from '@qwertix/room-contracts';
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
		type: string,
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

			sendMessage(ws, 'JOIN_ROOM', {
				roomId: room.id(),
				username: 'User1',
			});

			// Wait a tick for async handlers
			await new Promise(process.nextTick);

			expect(ws.roomId).toBe(room.id());
			expect(ws.username).toBe('User1');

			// Check that ROOM_STATE was sent at some point
			const roomStateMsg = ws.sentMessages.find((m) =>
				m.includes('ROOM_STATE'),
			);
			expect(roomStateMsg).toBeDefined();

			const participant = room.participants().get(ws.userId!);
			expect(participant).toBeDefined();
			expect(participant?.username).toBe('User1');
		});

		it('should fail if room does not exist', async () => {
			const ws = connectClient();
			sendMessage(ws, 'JOIN_ROOM', {
				roomId: 'INVALID',
				username: 'User1',
			});
			await new Promise(process.nextTick);

			const lastMsg = ws.sentMessages[ws.sentMessages.length - 1];
			expect(lastMsg).toContain('ERROR');
		});

		it('should authenticate with token', async () => {
			const room = await roomService.createRoom();
			const ws = connectClient();

			sendMessage(ws, 'JOIN_ROOM', {
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
			sendMessage(ws, 'JOIN_ROOM', { roomId: room.id(), username: 'Host' });
			await new Promise(process.nextTick);

			// Start Race
			vi.useFakeTimers();
			vi.setSystemTime(10000); // Start at t=10000 to avoid Date.now()=0 issues

			sendMessage(ws, 'START_RACE', {});
			await new Promise(process.nextTick);

			expect(room.status()).toBe(RoomStatusEnum.COUNTDOWN);
			vi.advanceTimersByTime(3000); // Countdown
			expect(room.status()).toBe(RoomStatusEnum.RACING);

			// Update Progress (send substantial amount to ensure > 0 progress)
			sendMessage(ws, 'UPDATE_PROGRESS', { typedLength: 10 });
			await new Promise(process.nextTick);

			const p = room.participants().get(ws.userId!);
			expect(p?.stats().progress).toBeGreaterThan(0);

			// Finish
			const totalLen = room.text().join(' ').length;
			sendMessage(ws, 'UPDATE_PROGRESS', { typedLength: totalLen });
			await new Promise(process.nextTick);

			expect(room.status()).toBe(RoomStatusEnum.FINISHED);

			vi.useRealTimers();
		});
	});

	describe('SUBMIT_RESULT', () => {
		it('should save result to repo', async () => {
			const room = await roomService.createRoom();
			const ws = connectClient();

			sendMessage(ws, 'JOIN_ROOM', {
				roomId: room.id(),
				username: 'User1',
				token: 'valid', // Authenticated
			});
			await new Promise(process.nextTick);

			// Need to START RACE for stats to be calculated
			vi.useFakeTimers();
			sendMessage(ws, 'START_RACE', {});
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

			sendMessage(ws, 'SUBMIT_RESULT', {
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
});
