import { RaceModeEnum, RoomStatusEnum } from '@qwertix/room-contracts';
import { describe, expect, it, vi } from 'vitest';
import { Room } from '../../src/domain/room/Room';

describe('Room Domain Logic', () => {
	const createRoom = () =>
		new Room(
			{
				mode: RaceModeEnum.WORDS,
				wordCount: 2,
			},
			['hello', 'world'],
		);

	it('should calculate final stats correctly', async () => {
		const room = createRoom();
		room.addParticipant('user-1', 'TestUser');
		room.startRace();
		room.startRacing();

		// Simulate 1 minute passage
		const oneMinute = 60 * 1000;
		vi.useFakeTimers();
		vi.advanceTimersByTime(oneMinute);

		// Simulate replay data for "hello wor" (1 mistake at end)
		const replayData = [
			{ key: 'h', timestamp: 100 },
			{ key: 'e', timestamp: 200 },
			{ key: 'l', timestamp: 300 },
			{ key: 'l', timestamp: 400 },
			{ key: 'o', timestamp: 500 },
			{ key: ' ', timestamp: 600 },
			{ key: 'w', timestamp: 700 },
			{ key: 'o', timestamp: 800 },
			{ key: 'r', timestamp: 900 },
		];

		const stats = room.getParticipantFinalStats('user-1', replayData);

		expect(stats).toBeDefined();
		if (stats) {
			expect(stats.accuracy).toBe(100);
			expect(stats.wpm).toBe(2); // 1.8 rounded to 2
		}
		vi.useRealTimers();
	});

	it('should handle backspaces in authoritative calculation', () => {
		const room = createRoom();
		room.addParticipant('user-1', 'TestUser');
		room.startRace();
		room.startRacing();

		// Type "hellx" -> backspace -> "o"
		const replayData = [
			{ key: 'h', timestamp: 100 },
			{ key: 'e', timestamp: 200 },
			{ key: 'l', timestamp: 300 },
			{ key: 'l', timestamp: 400 },
			{ key: 'x', timestamp: 500 },
			{ key: 'Backspace', timestamp: 600 },
			{ key: 'o', timestamp: 700 },
		];

		const stats = room.getParticipantFinalStats('user-1', replayData);
		expect(stats?.accuracy).toBe(100); // Result is "hello"
	});

	it('should handle Ctrl+Backspace in authoritative calculation', () => {
		const room = createRoom();
		room.addParticipant('user-1', 'TestUser');
		room.startRace();
		room.startRacing();

		// Type "hello world" -> Ctrl+Backspace -> "" (if none confirmed)
		const replayData = [
			{ key: 'h', timestamp: 100 },
			{ key: 'e', timestamp: 200 },
			{ key: 'l', timestamp: 300 },
			{ key: 'l', timestamp: 400 },
			{ key: 'o', timestamp: 500 },
			{ key: ' ', timestamp: 600 },
			{ key: 'w', timestamp: 700 },
			{ key: 'o', timestamp: 800 },
			{ key: 'r', timestamp: 900 },
			{
				key: 'Backspace',
				timestamp: 1000,
				ctrlKey: true,
				confirmedIndex: 0,
			},
		];

		const stats = room.getParticipantFinalStats('user-1', replayData);
		// After Ctrl+Backspace on "hello wor", results should be "hello " (since it deletes current word "wor")
		// "hello wor" -> trimmed is "hello wor", lastSpace is at index 5. Result: "hello "
		// Resulting accuracy for "hello " against "hello world" should be 100% for the prefix.
		expect(stats?.accuracy).toBe(100);
	});

	it('should update progress and calculate real-time WPM', () => {
		const room = createRoom();
		room.addParticipant('user-1', 'TestUser');
		room.startRace();
		room.startRacing();

		// "hello world" is 11 chars
		room.updateParticipantProgress('user-1', 5.5); // 50%

		const participant = room.participants().get('user-1');

		expect(participant?.stats().progress).toBe(50);
		expect(participant?.stats().wpm).toBeDefined();
	});

	it('should restart room correctly', () => {
		const room = createRoom();

		room.addParticipant('u1', 'user1');
		room.startRace();
		room.startRacing();
		room.updateParticipantProgress('u1', 5);
		room.finishRacing();
		room.restart(['new', 'text']);

		expect(room.status()).toBe(RoomStatusEnum.LOBBY);
		expect(room.raceStartTime()).toBeNull();
		expect(room.participants().get('u1')?.stats().progress).toBe(0);
	});

	it('should convert to DTO correctly', () => {
		const room = createRoom();
		room.addParticipant('u1', 'user1');

		const dto = room.toDTO();

		expect(dto.id).toBe(room.id());
		expect(dto.participants).toHaveLength(1);
		expect(dto.text).toEqual(room.text());
	});
});
