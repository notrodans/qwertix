import {
	type Participant,
	RaceModeEnum,
	type RoomConfig,
	type RoomDTO,
	type RoomStatus,
} from '@qwertix/room-contracts';

export { RaceModeEnum, type RoomConfig, type RoomStatus, type Participant };

export class Room {
	public id: string;
	public status: RoomStatus = 'LOBBY';
	public participants: Map<string, Participant> = new Map();
	public config: RoomConfig;
	public text: string[];
	public createdAt: number;
	public raceStartTime: number | null = null;
	public presetId: number | null = null;

	constructor(
		id: string,
		text: string[],
		config: RoomConfig = { mode: RaceModeEnum.WORDS, wordCount: 30 },
	) {
		this.id = id;
		this.text = text;
		this.config = config;
		this.createdAt = Date.now();
		if (config && typeof config === 'object' && 'id' in config) {
			this.presetId = (config as { id: number }).id;
		}
	}

	addParticipant(id: string, username: string): Participant {
		const isHost = this.participants.size === 0;
		const participant: Participant = {
			socketId: id,
			username,
			isHost,
			progress: 0,
			wpm: 0,
			rank: null,
			finishedAt: null,
		};
		this.participants.set(id, participant);
		return participant;
	}

	removeParticipant(id: string): void {
		this.participants.delete(id);
		if (this.participants.size > 0) {
			const hasHost = Array.from(this.participants.values()).some(
				(p) => p.isHost,
			);
			if (!hasHost) {
				const nextPlayer = this.participants.values().next().value;
				if (nextPlayer) {
					nextPlayer.isHost = true;
					this.participants.set(nextPlayer.socketId, nextPlayer);
				}
			}
		}
	}

	updateProgress(id: string, progress: number, wpm: number): void {
		const participant = this.participants.get(id);
		if (!participant) return;

		participant.progress = progress;
		participant.wpm = wpm;

		if (this.config.mode === RaceModeEnum.WORDS) {
			// Simple progress check 100%
			if (progress >= 100 && !participant.finishedAt) {
				participant.finishedAt = Date.now();
				participant.rank = this.getNextRank();
			}
		}
		// TIME mode finish is handled by server timer usually, or client saying "time up"
		// But conceptually, in time mode, you don't "finish" until time is up.
	}

	private getNextRank(): number {
		const finishedCount = Array.from(this.participants.values()).filter(
			(p) => p.rank !== null,
		).length;
		return finishedCount + 1;
	}

	startRace(): void {
		this.status = 'COUNTDOWN';
	}

	startRacing(): void {
		this.status = 'RACING';
		this.raceStartTime = Date.now();
	}

	appendWords(newWords: string[]): void {
		this.text.push(...newWords);
	}

	toDTO(): RoomDTO {
		return {
			id: this.id,
			status: this.status,
			participants: Array.from(this.participants.values()),
			config: this.config,
			text: this.text,
		};
	}
}
