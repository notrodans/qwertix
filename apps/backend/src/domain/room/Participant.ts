import type { ParticipantDTO } from '@qwertix/room-contracts';
import { RaceStats } from './RaceStats';

/**
 * Represents a participant in a race room.
 */
export class Participant {
	private _stats: RaceStats;
	public finishedAt: number | null = null;
	public rank: number | null = null;
	public isHost: boolean = false;

	constructor(
		public socketId: string,
		public readonly username: string,
		isHost: boolean,
		public readonly dbUserId?: string,
	) {
		this._stats = new RaceStats();
		this.isHost = isHost;
	}

	/**
	 * Updates the participant's WPM and accuracy stats.
	 * @param newWpm - The new WPM value.
	 * @param newAccuracy - The new accuracy value.
	 */
	updateStats(newWpm: number, newAccuracy: number): void {
		this._stats = this._stats.update(newWpm, newAccuracy, this._stats.progress);
	}

	/**
	 * Updates the participant's progress percentage.
	 * @param progress - The new progress percentage (0-100).
	 */
	updateProgress(progress: number): void {
		this._stats = new RaceStats(
			this._stats.wpm,
			this._stats.accuracy,
			progress,
		);
	}

	/**
	 * Marks the participant as finished.
	 * @param rank - The rank the participant achieved.
	 * @param time - The timestamp when they finished.
	 */
	markFinished(rank: number, time: number): void {
		if (!this.finishedAt) {
			this.finishedAt = time;
			this.rank = rank;
		}
	}

	/**
	 * Resets the participant's state for a new race.
	 */
	reset(): void {
		this._stats = new RaceStats();
		this.finishedAt = null;
		this.rank = null;
	}

	/**
	 * Converts the participant to a Data Transfer Object.
	 * @returns The ParticipantDTO.
	 */
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
			...(this.dbUserId && { dbUserId: this.dbUserId })
		};
	}

	/**
	 * Gets the current stats of the participant.
	 * @returns The RaceStats object.
	 */
	stats() {
		return this._stats;
	}
}
