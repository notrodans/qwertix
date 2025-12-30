import { describe, expect, it, vi } from 'vitest';
import { RaceModeEnum, Room } from '../src/domain/room';

describe('Metrics Calculation via Room', () => {
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
			expect(stats.wpm).toBe(1.8); // 9 chars / 5 = 1.8 words. 1.8 words / 1 min = 1.8 WPM
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
});