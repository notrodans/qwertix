import { describe, expect, it } from 'vitest';
import { RaceStats } from '@/domain/room/RaceStats';

describe('RaceStats', () => {
	it('should initialize with default values', () => {
		const stats = new RaceStats();
		expect(stats.wpm).toBe(0);
		expect(stats.accuracy).toBe(100);
		expect(stats.progress).toBe(0);
	});

	it('should initialize with custom values', () => {
		const stats = new RaceStats(60, 95, 50);
		expect(stats.wpm).toBe(60);
		expect(stats.accuracy).toBe(95);
		expect(stats.progress).toBe(50);
	});

	it('should return a new instance on update (immutability)', () => {
		const stats1 = new RaceStats(0, 100, 0);
		const stats2 = stats1.update(50, 98, 20);

		expect(stats1.wpm).toBe(0); // stats1 remains unchanged
		expect(stats2.wpm).toBe(50);
		expect(stats2.accuracy).toBe(98);
		expect(stats2.progress).toBe(20);
		expect(stats1).not.toBe(stats2);
	});
});
