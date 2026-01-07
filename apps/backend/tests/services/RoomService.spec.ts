import {
	RaceModeEnum,
	type RoomConfig,
	RoomStatusEnum,
} from '@qwertix/room-contracts';
import { beforeEach, describe, expect, it } from 'vitest';
import { Room } from '../../src/domain/room/Room';
import { MemoryRoomRepository } from '../../src/repositories/MemoryRoomRepository';
import { RoomService } from '../../src/services/RoomService';
import { WordService } from '../../src/services/WordService';

describe('RoomService Logic', () => {
	let roomService: RoomService;
	let roomRepo: MemoryRoomRepository;

	beforeEach(() => {
		roomRepo = new MemoryRoomRepository();
		roomService = new RoomService(roomRepo, new WordService());
	});

	it('should create a room with correct defaults', async () => {
		const room = await roomService.createRoom();
		expect(room).toBeInstanceOf(Room);
		expect(room.id()).toHaveLength(6);
		expect(room.status()).toBe(RoomStatusEnum.LOBBY);
		expect(room.text().length).toBe(30);
		expect(await roomService.get(room.id())).toBe(room);
	});

	it('should allow participants to join', async () => {
		const room = await roomService.createRoom();
		const p1 = room.addParticipant('socket-1', 'User 1');
		const p2 = room.addParticipant('socket-2', 'User 2');

		expect(room.participants().size).toBe(2);
		expect(p1.isHost).toBe(true);
		expect(p2.isHost).toBe(false);
	});

	it('should handle race flow', async () => {
		const room = await roomService.createRoom();
		room.addParticipant('socket-1', 'User 1');
		room.addParticipant('socket-2', 'User 2');

		room.startRace();
		expect(room.status()).toBe(RoomStatusEnum.COUNTDOWN);

		room.startRacing();
		expect(room.status()).toBe(RoomStatusEnum.RACING);
		expect(room.raceStartTime()).toBeDefined();

		const totalLength = room.text().join(' ').length;

		// Update progress
		await roomService.updateProgress(
			room.id(),
			'socket-1',
			Math.floor(totalLength / 2),
		);
		expect(
			room.participants().get('socket-1')?.stats().progress,
		).toBeGreaterThan(40);

		// Finish race
		await roomService.updateProgress(room.id(), 'socket-1', totalLength);
		expect(room.participants().get('socket-1')?.finishedAt).toBeDefined();
		expect(room.participants().get('socket-1')?.rank).toBe(1);

		await roomService.updateProgress(room.id(), 'socket-2', totalLength);
		expect(room.participants().get('socket-2')?.rank).toBe(2);
	});

	it('should remove participant and reassign host', async () => {
		const room = await roomService.createRoom();
		room.addParticipant('socket-1', 'User 1');
		room.addParticipant('socket-2', 'User 2');

		room.removeParticipant('socket-1');
		expect(room.participants().size).toBe(1);
		expect(room.participants().get('socket-2')?.isHost).toBe(true);
	});

	it('should append words to room', async () => {
		const room = await roomService.createRoom();
		const initialLength = room.text().length;
		const added = await roomService.appendWordsToRoom(room.id(), 10);

		expect(added?.length).toBe(10);
		expect(room.text().length).toBe(initialLength + 10);
	});

	it('should create room with custom config', async () => {
		const config: RoomConfig = { mode: RaceModeEnum.WORDS, wordCount: 50 };
		const room = await roomService.createRoom(config);
		expect(room.config().mode).toBe(RaceModeEnum.WORDS);
		expect(room.text().length).toBe(50);
	});

	it('should promote new host when old one leaves', async () => {
		const room = await roomService.createRoom();
		room.addParticipant('s1', 'u1');
		room.addParticipant('s2', 'u2');

		expect(room.participants().get('s1')?.isHost).toBe(true);

		room.removeParticipant('s1');
		expect(room.participants().get('s2')?.isHost).toBe(true);
	});

	it('should update config and text', async () => {
		const room = await roomService.createRoom();
		const newConfig: RoomConfig = { mode: RaceModeEnum.WORDS, wordCount: 10 };

		await roomService.updateRoomConfig(room.id(), newConfig);

		const config = room.config();
		if (config.mode === RaceModeEnum.WORDS) {
			expect(config.wordCount).toBe(10);
		} else {
			throw new Error('Room mode should be WORDS');
		}
		expect(room.text().length).toBe(10);
	});

	it('should delete room', async () => {
		const room = await roomService.createRoom();
		const roomId = room.id();
		expect(await roomService.get(roomId)).toBeDefined();

		await roomService.delete(roomId);
		expect(await roomService.get(roomId)).toBeUndefined();
	});

	it('should prune inactive participants from lobby', async () => {
		const room = await roomService.createRoom();
		room.addParticipant('s1', 'u1');
		const p2 = room.addParticipant('s2', 'u2');

		// p2 was active 11 minutes ago
		p2.lastActiveAt = Date.now() - 11 * 60 * 1000;

		const changes = await roomService.checkInactivity();

		expect(changes.length).toBe(1);
		expect(changes[0]?.roomId).toBe(room.id());
		expect(changes[0]?.removedParticipants).toContain('s2');
		expect(room.participants().has('s2')).toBe(false);
		expect(room.participants().has('s1')).toBe(true);
	});
});
