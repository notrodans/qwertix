import type { RoomConfig } from '@qwertix/room-contracts';
import type { RaceStats } from '@/domain/room/RaceStats';

export interface IRaceRulesStrategy {
	isFinished(stats: RaceStats, config: RoomConfig, startTime: number): boolean;
	calculateProgress(
		typedLength: number,
		totalLength: number,
		startTime: number,
	): number;
}
