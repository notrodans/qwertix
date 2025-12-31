import type { FastifyBaseLogger, FastifyInstance } from 'fastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WebSocket, WebSocketServer } from 'ws';
import { Room } from '../../src/domain/room';
import { RoomManager } from '../../src/managers/room.manager';
import { SocketManager } from '../../src/managers/socket.manager';
import { ResultService } from '../../src/services/result.service';

// Mock ws
vi.mock('ws');

describe('SocketManager', () => {
	// biome-ignore lint/correctness/noUnusedVariables: needed
	let socketManager: SocketManager;
	// biome-ignore lint/suspicious/noExplicitAny: needed
	let mockWss: any;
	let mockRoomManager: RoomManager;
	let mockResultService: ResultService;
	let mockLogger: FastifyBaseLogger;
	let mockApp: FastifyInstance;
	// biome-ignore lint/suspicious/noExplicitAny: needed
	let mockWs: any;

	beforeEach(() => {
		mockWss = {
			clients: new Set(),
			on: vi.fn(),
		};

		mockRoomManager = {
			getRoom: vi.fn(),
			updateRoomConfig: vi.fn(),
			appendWordsToRoom: vi.fn(),
			deleteRoom: vi.fn(),
		} as unknown as RoomManager;

		mockResultService = {
			saveResult: vi.fn(),
		} as unknown as ResultService;

		mockLogger = {
			info: vi.fn(),
			error: vi.fn(),
			warn: vi.fn(),
			debug: vi.fn(),
		} as unknown as FastifyBaseLogger;

		mockApp = {
			jwt: {
				verify: vi.fn(),
			},
		} as unknown as FastifyInstance;

		mockWs = {
			on: vi.fn(),
			send: vi.fn(),
			terminate: vi.fn(),
			ping: vi.fn(),
			readyState: WebSocket.OPEN,
		};

		socketManager = new SocketManager(
			mockWss as unknown as WebSocketServer,
			mockRoomManager,
			mockLogger,
			mockResultService,
			mockApp,
		);
	});

	const setupConnection = () => {
		// biome-ignore lint/suspicious/noExplicitAny: needed
		const connectionHandler = (mockWss.on as any).mock.calls.find(
			// biome-ignore lint/suspicious/noExplicitAny: needed
			(call: any[]) => call[0] === 'connection',
		)[1];
		connectionHandler(mockWs);
		// biome-ignore lint/suspicious/noExplicitAny: needed
		return (mockWs.on as any).mock.calls.find(
			// biome-ignore lint/suspicious/noExplicitAny: needed
			(call: any[]) => call[0] === 'message',
		)[1];
	};

	it('should handle JOIN_ROOM', () => {
		const messageHandler = setupConnection();
		const room = new Room('test-room', ['word']);
		// biome-ignore lint/suspicious/noExplicitAny: needed
		(mockRoomManager.getRoom as any).mockReturnValue(room);

		messageHandler(
			JSON.stringify({
				type: 'JOIN_ROOM',
				payload: { roomId: 'test-room', username: 'user1' },
			}),
		);

		expect(mockWs.roomId).toBe('test-room');
		expect(mockWs.username).toBe('user1');
		expect(mockWs.send).toHaveBeenCalledWith(
			expect.stringContaining('ROOM_STATE'),
		);
	});

	it('should handle START_RACE with 3s countdown', () => {
		const messageHandler = setupConnection();
		const room = new Room('test-room', ['word']);
		room.addParticipant('h1', 'host');
		mockWs.roomId = 'test-room';
		mockWs.userId = 'h1';

		// biome-ignore lint/suspicious/noExplicitAny: needed
		(mockRoomManager.getRoom as any).mockReturnValue(room);
		// biome-ignore lint/suspicious/noExplicitAny: needed
		(mockWss.clients as any).add(mockWs);

		vi.useFakeTimers();
		messageHandler(
			JSON.stringify({
				type: 'START_RACE',
				payload: {},
			}),
		);

		// Expect countdown start
		expect(room.status()).toBe('COUNTDOWN');
		expect(mockWs.send).toHaveBeenCalledWith(
			expect.stringContaining('COUNTDOWN_START'),
		);

		// Advance 3 seconds
		vi.advanceTimersByTime(3000);

		// Expect race start
		expect(room.status()).toBe('RACING');
		expect(mockWs.send).toHaveBeenCalledWith(
			expect.stringContaining('RACE_START'),
		);
		vi.useRealTimers();
	});

	it('should terminate race immediately when ONE player finishes', () => {
		const messageHandler = setupConnection();
		const room = new Room('test-room', ['hello']);
		room.addParticipant('u1', 'user1');
		room.addParticipant('u2', 'user2');
		room.startRacing();

		mockWs.roomId = 'test-room';
		mockWs.userId = 'u1';
		// biome-ignore lint/suspicious/noExplicitAny: needed
		(mockRoomManager.getRoom as any).mockReturnValue(room);

		// Setup broadcast mock
		const client2 = {
			...mockWs,
			userId: 'u2',
			roomId: 'test-room',
			readyState: WebSocket.OPEN,
			send: vi.fn(),
		};
		// biome-ignore lint/suspicious/noExplicitAny: needed
		(mockWss.clients as any).add(mockWs);
		// biome-ignore lint/suspicious/noExplicitAny: needed
		(mockWss.clients as any).add(client2);

		messageHandler(
			JSON.stringify({
				type: 'UPDATE_PROGRESS',
				payload: { typedLength: 5 }, // "hello" length is 5 -> 100%
			}),
		);

		expect(room.status()).toBe('FINISHED');
		expect(mockWs.send).toHaveBeenCalledWith(
			expect.stringContaining('RACE_FINISHED'),
		);
		expect(client2.send).toHaveBeenCalledWith(
			expect.stringContaining('RACE_FINISHED'),
		);
	});

	it('should handle UPDATE_SETTINGS by host', () => {
		const messageHandler = setupConnection();
		const room = new Room('test-room', ['word']);
		room.addParticipant('h1', 'host');
		mockWs.roomId = 'test-room';
		mockWs.userId = 'h1';

		// biome-ignore lint/suspicious/noExplicitAny: needed
		(mockRoomManager.getRoom as any).mockReturnValue(room);
		// biome-ignore lint/suspicious/noExplicitAny: needed
		(mockRoomManager.updateRoomConfig as any).mockReturnValue(true);
		// biome-ignore lint/suspicious/noExplicitAny: needed
		(mockWss.clients as any).add(mockWs);

		messageHandler(
			JSON.stringify({
				type: 'UPDATE_SETTINGS',
				payload: { mode: 1, wordCount: 50 },
			}),
		);

		expect(mockRoomManager.updateRoomConfig).toHaveBeenCalled();
	});

	it('should handle TRANSFER_HOST', () => {
		const messageHandler = setupConnection();
		const room = new Room('test-room', ['word']);
		room.addParticipant('h1', 'host');
		room.addParticipant('u1', 'user');
		mockWs.roomId = 'test-room';
		mockWs.userId = 'h1';

		// biome-ignore lint/suspicious/noExplicitAny: needed
		(mockRoomManager.getRoom as any).mockReturnValue(room);
		// biome-ignore lint/suspicious/noExplicitAny: needed
		(mockWss.clients as any).add(mockWs);

		messageHandler(
			JSON.stringify({
				type: 'TRANSFER_HOST',
				payload: { targetId: 'u1' },
			}),
		);

		expect(room.participants().get('u1')?.isHost).toBe(true);
		expect(room.participants().get('h1')?.isHost).toBe(false);
	});

	it('should handle SUBMIT_RESULT', async () => {
		const messageHandler = setupConnection();
		const room = new Room('test-room', ['hello']);
		room.addParticipant('u1', 'user1');
		room.startRacing();

		mockWs.roomId = 'test-room';
		mockWs.userId = 'u1';
		mockWs.dbUserId = 123;
		// biome-ignore lint/suspicious/noExplicitAny: needed
		(mockRoomManager.getRoom as any).mockReturnValue(room);

		await messageHandler(
			JSON.stringify({
				type: 'SUBMIT_RESULT',
				payload: {
					wpm: 60,
					accuracy: 100,
					consistency: 90,
					replayData: [{ key: 'h', timestamp: 10 }],
				},
			}),
		);

		expect(mockResultService.saveResult).toHaveBeenCalledWith(
			123,
			null,
			expect.any(Number),
			expect.any(Number),
			expect.any(Number),
			90,
			expect.any(Array),
		);
	});

	it('should handle RESTART_GAME', () => {
		const messageHandler = setupConnection();
		const room = new Room('test-room', ['word']);
		room.addParticipant('h1', 'host');
		room.finishRacing();

		mockWs.roomId = 'test-room';
		mockWs.userId = 'h1';
		// biome-ignore lint/suspicious/noExplicitAny: needed
		(mockRoomManager.getRoom as any).mockReturnValue(room);
		// biome-ignore lint/suspicious/noExplicitAny: needed
		(mockWss.clients as any).add(mockWs);

		messageHandler(
			JSON.stringify({
				type: 'RESTART_GAME',
				payload: {},
			}),
		);

		expect(room.status()).toBe('LOBBY');
	});

	it('should handle LOAD_MORE_WORDS', () => {
		const messageHandler = setupConnection();
		const room = new Room('test-room', ['word']);
		mockWs.roomId = 'test-room';
		mockWs.userId = 'u1';

		// biome-ignore lint/suspicious/noExplicitAny: needed
		(mockRoomManager.getRoom as any).mockReturnValue(room);
		// biome-ignore lint/suspicious/noExplicitAny: needed
		(mockRoomManager.appendWordsToRoom as any).mockReturnValue([
			'new',
			'words',
		]);
		// biome-ignore lint/suspicious/noExplicitAny: needed
		(mockWss.clients as any).add(mockWs);

		messageHandler(
			JSON.stringify({
				type: 'LOAD_MORE_WORDS',
				payload: {},
			}),
		);

		expect(mockRoomManager.appendWordsToRoom).toHaveBeenCalledWith(
			'test-room',
			20,
		);
		expect(mockWs.send).toHaveBeenCalledWith(
			expect.stringContaining('WORDS_APPENDED'),
		);
	});

	it('should handle client disconnect', () => {
		setupConnection();

		// biome-ignore lint/suspicious/noExplicitAny: needed
		const closeHandler = (mockWs.on as any).mock.calls.find(
			// biome-ignore lint/suspicious/noExplicitAny: needed
			(call: any[]) => call[0] === 'close',
		)[1];

		const room = new Room('test-room', ['word']);
		room.addParticipant('u1', 'user1');

		mockWs.roomId = 'test-room';
		mockWs.userId = 'u1';
		// biome-ignore lint/suspicious/noExplicitAny: needed
		(mockRoomManager.getRoom as any).mockReturnValue(room);
		// biome-ignore lint/suspicious/noExplicitAny: needed
		(mockWss.clients as any).add(mockWs);

		closeHandler();

		expect(room.participants().has('u1')).toBe(false);
		expect(mockRoomManager.deleteRoom).toHaveBeenCalledWith('test-room');
	});
});
