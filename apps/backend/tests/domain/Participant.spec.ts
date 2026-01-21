import { describe, expect, it, vi } from 'vitest';
import { Participant } from '@/domain/room/Participant';

describe('Participant', () => {
	const socketId = 'socket-1';
	const username = 'User 1';
	const isHost = true;
	const dbUserId = 'db-user-1';

	it('should initialize correctly', () => {
		const participant = new Participant(socketId, username, isHost, dbUserId);

		expect(participant.socketId).toBe(socketId);
		expect(participant.username).toBe(username);
		expect(participant.isHost).toBe(isHost);
		expect(participant.dbUserId).toBe(dbUserId);
		expect(participant.stats()).toEqual({ wpm: 0, accuracy: 100, progress: 0 });
		expect(participant.finishedAt).toBeNull();
		expect(participant.rank).toBeNull();
		expect(participant.lastActiveAt).toBeDefined();
	});

	it('should update stats correctly', () => {
		const participant = new Participant(socketId, username, isHost);
		participant.updateStats(50, 95);

		expect(participant.stats().wpm).toBe(50);
		expect(participant.stats().accuracy).toBe(95);
		expect(participant.stats().progress).toBe(0);
	});

	it('should update progress correctly', () => {
		const participant = new Participant(socketId, username, isHost);
		participant.updateProgress(50);

		expect(participant.stats().progress).toBe(50);
		expect(participant.stats().wpm).toBe(0);
		expect(participant.stats().accuracy).toBe(100);
	});

	it('should mark finished correctly', () => {
		const participant = new Participant(socketId, username, isHost);
		const rank = 1;
		const time = 1000;

		participant.markFinished(rank, time);

		expect(participant.finishedAt).toBe(time);
		expect(participant.rank).toBe(rank);
	});

	it('should NOT overwrite finishedAt if already set', () => {
		const participant = new Participant(socketId, username, isHost);
		const rank1 = 1;
		const time1 = 1000;
		const rank2 = 2;
		const time2 = 2000;

		participant.markFinished(rank1, time1);
		participant.markFinished(rank2, time2);

		expect(participant.finishedAt).toBe(time1);
		expect(participant.rank).toBe(rank1);
	});

	it('should reset state correctly', () => {
		const participant = new Participant(socketId, username, isHost);
		participant.updateStats(50, 95);
		participant.updateProgress(100);
		participant.markFinished(1, 1000);

		participant.reset();

		expect(participant.stats()).toEqual({ wpm: 0, accuracy: 100, progress: 0 });
		expect(participant.finishedAt).toBeNull();
		expect(participant.rank).toBeNull();
	});

	it('should convert to DTO correctly', () => {
		const participant = new Participant(socketId, username, isHost, dbUserId);
		participant.updateStats(60, 98);
		participant.updateProgress(50);

		const dto = participant.toDTO();

		expect(dto).toEqual({
			socketId,
			username,
			isHost,
			progress: 50,
			wpm: 60,
			accuracy: 98,
			rank: null,
			finishedAt: null,
			dbUserId,
		});
	});

	it('should touch lastActiveAt', () => {
		const participant = new Participant(socketId, username, isHost);
		const initialLastActiveAt = participant.lastActiveAt;

		// Mock Date.now to advance time
		vi.useFakeTimers();
		vi.advanceTimersByTime(1000);

		participant.touch();

		expect(participant.lastActiveAt).toBeGreaterThan(initialLastActiveAt);
		vi.useRealTimers();
	});
});
