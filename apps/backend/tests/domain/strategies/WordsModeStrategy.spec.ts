import { describe, expect, it } from 'vitest';
import { RaceStats } from '@/domain/room/RaceStats';
import { WordsModeStrategy } from '@/domain/room/strategies/WordsModeStrategy';

describe('WordsModeStrategy', () => {
	const strategy = new WordsModeStrategy();

	it('should calculate progress based on typed length', () => {
		const progress = strategy.calculateProgress(50, 100);
		expect(progress).toBe(50);
	});

	it('should handle division by zero (empty text)', () => {
		const progress = strategy.calculateProgress(0, 0);
		expect(progress).toBe(0);
	});

	it('should cap progress at 100%', () => {
		const progress = strategy.calculateProgress(110, 100);
		expect(progress).toBe(100);
	});

	it('should return true for isFinished when progress is 100%', () => {
		const stats = new RaceStats(0, 0, 100);
		const isFinished = strategy.isFinished(stats);
		expect(isFinished).toBe(true);
	});

	it('should return false for isFinished when progress is < 100%', () => {
		const stats = new RaceStats(0, 0, 99);
		const isFinished = strategy.isFinished(stats);
		expect(isFinished).toBe(false);
	});
});
