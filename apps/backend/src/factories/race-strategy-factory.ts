import { RaceModeEnum, type RoomConfig } from '@qwertix/room-contracts';
import type { IRaceRulesStrategy } from '@/strategies/base-rule-strategy';
import { TimeModeStrategy } from '@/strategies/time-mode-strategy';
import { WordsModeStrategy } from '@/strategies/words-mode-strategy';

export class RaceStrategyFactory {
	constructor() {}

	getStrategy(config: RoomConfig): IRaceRulesStrategy {
		if (config.mode === RaceModeEnum.WORDS) {
			return new WordsModeStrategy();
		} else if (config.mode === RaceModeEnum.TIME) {
			return new TimeModeStrategy(60);
		} else {
			throw new Error('Race strategy not found');
		}
	}
}
