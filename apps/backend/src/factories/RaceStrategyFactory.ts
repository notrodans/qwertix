import { RaceModeEnum, type RoomConfig } from '@qwertix/room-contracts';
import type { IRaceRulesStrategy } from '@/domain/room/strategies/BaseRuleStrategy';
import { TimeModeStrategy } from '@/domain/room/strategies/TimeModeStrategy';
import { WordsModeStrategy } from '@/domain/room/strategies/WordsModeStrategy';

/**
 * Factory for creating race rule strategies based on configuration.
 */
export class RaceStrategyFactory {
	constructor() {}

	/**
	 * Gets the appropriate race strategy for the given configuration.
	 * @param config - The room configuration.
	 * @returns An instance of IRaceRulesStrategy (Words or Time).
	 * @throws Error if the race mode is unknown.
	 */
	getStrategy(config: RoomConfig): IRaceRulesStrategy {
		switch (config.mode) {
			case RaceModeEnum.WORDS:
				return new WordsModeStrategy();
			case RaceModeEnum.TIME:
				return new TimeModeStrategy(config.duration);
			default:
				throw new Error('Race strategy not found');
		}
	}
}
