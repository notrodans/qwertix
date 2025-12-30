import {
	type Participant,
	RaceModeEnum,
	type RoomConfig,
	type RoomDTO,
	type RoomStatus,
} from '@qwertix/room-contracts';

export { RaceModeEnum, type RoomConfig, type RoomStatus, type Participant };

export class Room {
	private _id: string;
	private _status: RoomStatus = 'LOBBY';
	private _participants: Map<string, Participant> = new Map();
	private _config: RoomConfig;
	private _text: string[];
	private _createdAt: number;
	private _raceStartTime: number | null = null;
	private _presetId: number | null = null;

	constructor(
		id: string,
		text: string[],
		config: RoomConfig = { mode: RaceModeEnum.WORDS, wordCount: 30 },
	) {
		this._id = id;
		this._text = text;
		this._config = config;
		this._createdAt = Date.now();
		if (config && typeof config === 'object' && 'id' in config) {
			this._presetId = (config as { id: number }).id;
		}
	}

	id(): string {
		return this._id;
	}

	status(): RoomStatus {
		return this._status;
	}

	participants(): Map<string, Participant> {
		return this._participants;
	}

	config(): RoomConfig {
		return this._config;
	}

	text(): string[] {
		return this._text;
	}

	createdAt(): number {
		return this._createdAt;
	}

	raceStartTime(): number | null {
		return this._raceStartTime;
	}

	presetId(): number | null {
		return this._presetId;
	}

	addParticipant(id: string, username: string): Participant {
		const isHost = this._participants.size === 0;
		const participant: Participant = {
			socketId: id,
			username,
			isHost,
			progress: 0,
			wpm: 0,
			rank: null,
			finishedAt: null,
		};
		this._participants.set(id, participant);
		return participant;
	}

	removeParticipant(id: string): void {
		this._participants.delete(id);
		if (this._participants.size > 0) {
			const hasHost = Array.from(this._participants.values()).some(
				(p) => p.isHost,
			);
			if (!hasHost) {
				const nextPlayer = this._participants.values().next().value;
				if (nextPlayer) {
					nextPlayer.isHost = true;
					this._participants.set(nextPlayer.socketId, nextPlayer);
				}
			}
		}
	}

	updateProgress(id: string, progress: number, wpm: number): void {
		const participant = this._participants.get(id);
		if (!participant) return;

		participant.progress = progress;
		participant.wpm = wpm;

		if (this._config.mode === RaceModeEnum.WORDS) {
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
		const finishedCount = Array.from(this._participants.values()).filter(
			(p) => p.rank !== null,
		).length;
		return finishedCount + 1;
	}

	startRace(): void {
		this._status = 'COUNTDOWN';
	}

	startRacing(): void {
		this._status = 'RACING';
		this._raceStartTime = Date.now();
	}

	finishRacing(): void {
		this._status = 'FINISHED';
	}

	restart(): void {
		this._status = 'LOBBY';
		this._raceStartTime = null;
		// Reset participants progress
		for (const p of this._participants.values()) {
			p.progress = 0;
			p.wpm = 0;
			p.rank = null;
			p.finishedAt = null;
		}
	}

	appendWords(newWords: string[]): void {
		this._text.push(...newWords);
	}

	updateConfig(config: RoomConfig, newText?: string[]): void {
		this._config = config;
		if (newText) {
			this._text = newText;
		}
	}

	transferHost(targetSocketId: string): boolean {
		const currentHost = Array.from(this._participants.values()).find(
			(p) => p.isHost,
		);
		const targetParticipant = this._participants.get(targetSocketId);

		if (targetParticipant && currentHost) {
			currentHost.isHost = false;
			targetParticipant.isHost = true;
			return true;
		}
		return false;
	}

	toDTO(): RoomDTO {
		return {
			id: this._id,
			status: this._status,
			participants: Array.from(this._participants.values()),
			config: this._config,
			text: this._text,
		};
	}
}
