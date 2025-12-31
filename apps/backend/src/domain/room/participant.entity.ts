import type { ParticipantDTO } from '@qwertix/room-contracts';
import { RaceStats } from './value-objects/race-stats';

export class ParticipantEntity {
	private _stats: RaceStats;
	public finishedAt: number | null = null;
	public rank: number | null = null;
	public isHost: boolean = false;

	constructor(
		public readonly socketId: string,
		public readonly username: string,
		isHost: boolean,
	) {
		this._stats = new RaceStats();
		this.isHost = isHost;
	}

	updateStats(newWpm: number, newAccuracy: number): void {
		this._stats = this._stats.update(newWpm, newAccuracy, this._stats.progress);
	}

	updateProgress(progress: number): void {
		this._stats = new RaceStats(
			this._stats.wpm,
			this._stats.accuracy,
			progress,
		);
	}

	markFinished(rank: number, time: number): void {
		if (!this.finishedAt) {
			this.finishedAt = time;
			this.rank = rank;
		}
	}

	reset(): void {
		this._stats = new RaceStats();
		this.finishedAt = null;
		this.rank = null;
	}

	toDTO(): ParticipantDTO {
		return {
			socketId: this.socketId,
			username: this.username,
			isHost: this.isHost,
			progress: this._stats.progress,
			wpm: this._stats.wpm,
			accuracy: this._stats.accuracy,
			rank: this.rank,
			finishedAt: this.finishedAt,
		};
	}

	stats() {
		return this._stats;
	}
}
