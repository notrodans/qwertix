import type { RoomConfig } from '@qwertix/room-contracts';
import type { RaceStats } from '@/domain/value-objects/race-stats';
import type { IRaceRulesStrategy } from './base-rule-strategy';

export class TimeModeStrategy implements IRaceRulesStrategy {
	constructor(private timeLimitSeconds: number) {}

	calculateProgress(
		_typedLength: number,
		_totalLength: number,
		startTime: number,
	): number {
		// В режиме времени прогресс - это прошедшее время
		const elapsed = (Date.now() - startTime) / 1000;
		return Math.min((elapsed / this.timeLimitSeconds) * 100, 100);
	}

	isFinished(
		_stats: RaceStats,
		_config: RoomConfig,
		startTime: number,
	): boolean {
		const elapsed = (Date.now() - startTime) / 1000;
		return elapsed >= this.timeLimitSeconds;
	}
}
