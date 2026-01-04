import type { RaceStats } from '@/domain/room/RaceStats';
import type { IRaceRulesStrategy } from './BaseRuleStrategy';

/**
 * Strategy implementation for the WORDS race mode.
 */
export class WordsModeStrategy implements IRaceRulesStrategy {
	/**
	 * Calculates race progress based on typed length vs total length.
	 * @param typedLength - The number of characters typed.
	 * @param totalLength - The total number of characters in the text.
	 * @returns The progress percentage (0-100).
	 */
	calculateProgress(typedLength: number, totalLength: number): number {
		if (totalLength === 0) return 0;
		return Math.min((typedLength / totalLength) * 100, 100);
	}

	/**
	 * Checks if the race is finished (progress reaches 100%).
	 * @param stats - The current race stats.
	 * @returns True if progress is 100% or more.
	 */
	isFinished(stats: RaceStats): boolean {
		return stats.progress >= 100;
	}
}
