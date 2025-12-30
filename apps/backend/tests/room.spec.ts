import { type FastifyBaseLogger } from 'fastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RaceModeEnum, Room, type RoomConfig } from '../src/domain/room';
import { RoomManager } from '../src/managers/room-manager';
import { WordService } from '../src/services/word-service';

describe('Room Logic', () => {
	let roomManager: RoomManager;
	const mockLogger = {
		info: vi.fn(),
		error: vi.fn(),
		warn: vi.fn(),
		debug: vi.fn(),
	} as unknown as FastifyBaseLogger;

	beforeEach(() => {
		roomManager = new RoomManager(new WordService(), mockLogger);
	});

	it('should create a room with correct defaults', () => {
		const room = roomManager.createRoom();
		expect(room).toBeInstanceOf(Room);
		expect(room.id).toHaveLength(6);
		expect(room.status).toBe('LOBBY');
		expect(room.text.length).toBe(100);
		expect(roomManager.getRoom(room.id)).toBe(room);
	});

	it('should allow participants to join', () => {
		const room = roomManager.createRoom();
		const p1 = room.addParticipant('socket-1', 'User 1');
		const p2 = room.addParticipant('socket-2', 'User 2');

		expect(room.participants.size).toBe(2);
		expect(p1.isHost).toBe(true);
		expect(p2.isHost).toBe(false);
	});

	it('should handle race flow', () => {
		const room = roomManager.createRoom();
		room.addParticipant('socket-1', 'User 1');
		room.addParticipant('socket-2', 'User 2');

		room.startRace();
		expect(room.status).toBe('COUNTDOWN');

		room.startRacing();
		expect(room.status).toBe('RACING');
		expect(room.raceStartTime).toBeDefined();

		// Update progress
		room.updateProgress('socket-1', 50, 60);
		expect(room.participants.get('socket-1')?.progress).toBe(50);

		// Finish race
		room.updateProgress('socket-1', 100, 80);
		expect(room.participants.get('socket-1')?.finishedAt).toBeDefined();
		expect(room.participants.get('socket-1')?.rank).toBe(1);

		room.updateProgress('socket-2', 100, 70);
		expect(room.participants.get('socket-2')?.rank).toBe(2);
	});

	it('should remove participant and reassign host', () => {
		const room = roomManager.createRoom();
		room.addParticipant('socket-1', 'User 1');
		room.addParticipant('socket-2', 'User 2');

		room.removeParticipant('socket-1');
		expect(room.participants.size).toBe(1);
		expect(room.participants.get('socket-2')?.isHost).toBe(true);
	});

	it('should append words to room', () => {
		const room = roomManager.createRoom();
		const initialLength = room.text.length;
		const added = roomManager.appendWordsToRoom(room.id, 10);

		expect(added?.length).toBe(10);
		expect(room.text.length).toBe(initialLength + 10);
	});

	it('should create room with custom config', () => {
		const config: RoomConfig = { mode: RaceModeEnum.WORDS, wordCount: 50 };
		const room = roomManager.createRoom(config);
		expect(room.config.mode).toBe(RaceModeEnum.WORDS);
		expect(room.text.length).toBe(50);
	});

	it('should promote new host when old one leaves', () => {
		const room = roomManager.createRoom();
		room.addParticipant('s1', 'u1');
		room.addParticipant('s2', 'u2');

		expect(room.participants.get('s1')?.isHost).toBe(true);

		room.removeParticipant('s1');
		expect(room.participants.get('s2')?.isHost).toBe(true);
	});

	it('should update config and text', () => {
		const room = roomManager.createRoom();
		const newConfig: RoomConfig = { mode: RaceModeEnum.WORDS, wordCount: 10 };

		roomManager.updateRoomConfig(room.id, newConfig);

		if (room.config.mode === RaceModeEnum.WORDS) {
			expect(room.config.wordCount).toBe(10);
		} else {
			throw new Error('Room mode should be WORDS');
		}
		expect(room.text.length).toBe(10);
	});
});
