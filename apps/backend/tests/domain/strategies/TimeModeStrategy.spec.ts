import { RaceModeEnum, type RoomConfig } from '@qwertix/room-contracts';
import { describe, expect, it, vi } from 'vitest';
import { RaceStats } from '@/domain/room/RaceStats';
import { TimeModeStrategy } from '@/domain/room/strategies/TimeModeStrategy';

describe('TimeModeStrategy', () => {
	const duration = 60; // 60 seconds
	const strategy = new TimeModeStrategy(duration);
	const config: RoomConfig = { mode: RaceModeEnum.TIME } as RoomConfig;
	const stats = new RaceStats();

	it('should calculate progress based on time elapsed', () => {
		const startTime = Date.now();

		// Mock Date.now to simulate 30 seconds passed (50% progress)
		vi.useFakeTimers();
		vi.setSystemTime(startTime + 30000);

		const progress = strategy.calculateProgress(0, 0, startTime);
		expect(progress).toBeCloseTo(50);

		vi.useRealTimers();
	});

	it('should cap progress at 100%', () => {
		const startTime = Date.now();

		// Mock Date.now to simulate 70 seconds passed (>100% progress)
		vi.useFakeTimers();
		vi.setSystemTime(startTime + 70000);

		const progress = strategy.calculateProgress(0, 0, startTime);
		expect(progress).toBe(100);

		vi.useRealTimers();
	});

	it('should return true for isFinished when time is up', () => {
		const startTime = Date.now();

		// Mock Date.now to simulate 60 seconds passed
		vi.useFakeTimers();
		vi.setSystemTime(startTime + 60000);

		const isFinished = strategy.isFinished(stats, config, startTime);
		expect(isFinished).toBe(true);

		vi.useRealTimers();
	});

	it('should return false for isFinished when time is NOT up', () => {
		const startTime = Date.now();

		// Mock Date.now to simulate 59 seconds passed
		vi.useFakeTimers();
		vi.setSystemTime(startTime + 59000);

		const isFinished = strategy.isFinished(stats, config, startTime);
		expect(isFinished).toBe(false);

		vi.useRealTimers();
	});
});
