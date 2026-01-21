import { RaceModeEnum, type RoomConfig } from '@qwertix/room-contracts';
import { describe, expect, it } from 'vitest';
import { TimeModeStrategy } from '@/domain/room/strategies/TimeModeStrategy';
import { WordsModeStrategy } from '@/domain/room/strategies/WordsModeStrategy';
import { RaceStrategyFactory } from '@/factories/RaceStrategyFactory';

describe('RaceStrategyFactory', () => {
	const factory = new RaceStrategyFactory();

	it('should create WordsModeStrategy for WORDS mode', () => {
		const config: RoomConfig = {
			mode: RaceModeEnum.WORDS,
			wordCount: 30,
		};

		const strategy = factory.getStrategy(config);
		expect(strategy).toBeInstanceOf(WordsModeStrategy);
	});

	it('should create TimeModeStrategy for TIME mode', () => {
		const config: RoomConfig = {
			mode: RaceModeEnum.TIME,
			duration: 60,
		};

		const strategy = factory.getStrategy(config);
		expect(strategy).toBeInstanceOf(TimeModeStrategy);
	});

	it('should throw error for unknown mode', () => {
		const config = {
			mode: 'UNKNOWN',
		} as unknown as RoomConfig;

		expect(() => factory.getStrategy(config)).toThrow(
			'Race strategy not found',
		);
	});
});
