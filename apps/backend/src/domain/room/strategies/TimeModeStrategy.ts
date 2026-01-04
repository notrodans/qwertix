import type { RoomConfig } from '@qwertix/room-contracts';
import type { RaceStats } from '@/domain/room/RaceStats';
import type { IRaceRulesStrategy } from './BaseRuleStrategy';

/**
 * Strategy implementation for the TIME race mode.
 */
export class TimeModeStrategy implements IRaceRulesStrategy {
	constructor(private timeLimitSeconds: number) {}

	/**
	 * Calculates race progress based on time elapsed.
	 * @param _typedLength - Not used in Time mode.
	 * @param _totalLength - Not used in Time mode.
	 * @param startTime - The race start time.
	 * @returns The progress percentage (0-100).
	 */
	calculateProgress(
		_typedLength: number,
		_totalLength: number,
		startTime: number,
	): number {
		const elapsed = (Date.now() - startTime) / 1000;
		return Math.min((elapsed / this.timeLimitSeconds) * 100, 100);
	}

	/**
	 * Checks if the race is finished based on the time limit.
	 * @param _stats - Not used.
	 * @param _config - Not used.
	 * @param startTime - The race start time.
	 * @returns True if the time limit has been reached or exceeded.
	 */
	isFinished(
		_stats: RaceStats,
		_config: RoomConfig,
		startTime: number,
	): boolean {
		const elapsed = (Date.now() - startTime) / 1000;
		return elapsed >= this.timeLimitSeconds;
	}
}
