import { describe, expect, it, vi } from 'vitest';
import { RaceModeEnum, Room } from '../../src/domain/room';

describe('Room Domain Logic', () => {
	const createRoom = () =>
		new Room('TEST01', ['hello', 'world'], {
			mode: RaceModeEnum.WORDS,
			wordCount: 2,
		});

	it('should calculate final stats correctly', async () => {
		const room = createRoom();
		room.addParticipant('user-1', 'TestUser');
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
			expect(stats.wpm).toBeCloseTo(1.8, 2); // 9 chars / 5 = 1.8 words. 1.8 words / 1 min = 1.8 WPM
		}
		vi.useRealTimers();
	});

	it('should handle backspaces in authoritative calculation', () => {
		const room = createRoom();
		room.addParticipant('user-1', 'TestUser');
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
		// Wait, my engine says: if diff === 0 (no trailing spaces), it deletes the word.
		// "hello wor" -> trimmed is "hello wor", lastSpace is at index 5. Result: "hello "
		// Resulting accuracy for "hello " against "hello world" should be 100% for the prefix.
		expect(stats?.accuracy).toBe(100);
	});

	it('should update progress and calculate real-time WPM', () => {
		const room = createRoom();
		room.addParticipant('user-1', 'TestUser');
		room.startRacing();

		// "hello world" is 11 chars
		room.updateProgress('user-1', 5.5); // 50%

		const participant = room.participants().get('user-1');

		expect(participant?.progress).toBe(50);
		expect(participant?.wpm).toBeDefined();
	});

	it('should restart room correctly', () => {
		const room = createRoom();

		room.addParticipant('u1', 'user1');
		room.startRacing();
		room.updateProgress('u1', 5);
		room.finishRacing();
		room.restart();

		expect(room.status()).toBe('LOBBY');
		expect(room.raceStartTime()).toBeNull();
		expect(room.participants().get('u1')?.progress).toBe(0);
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
