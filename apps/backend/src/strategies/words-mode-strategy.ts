import type { RaceStats } from '@/domain/value-objects/race-stats';
import type { IRaceRulesStrategy } from './base-rule-strategy';

export class WordsModeStrategy implements IRaceRulesStrategy {
	calculateProgress(typedLength: number, totalLength: number): number {
		if (totalLength === 0) return 0;
		return Math.min((typedLength / totalLength) * 100, 100);
	}

	isFinished(stats: RaceStats): boolean {
		return stats.progress >= 100;
	}
}
