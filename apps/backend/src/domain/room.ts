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

	updateProgress(id: string, typedLength: number): void {
		const participant = this._participants.get(id);
		if (!participant || !this._raceStartTime) return;

		const now = Date.now();
		const totalLength = this._text.join(' ').length;

		participant.progress = this.calculateProgress(typedLength, totalLength);
		participant.wpm = this.calculateWPM(typedLength, this._raceStartTime, now);

		if (this._config.mode === RaceModeEnum.WORDS) {
			if (participant.progress >= 100 && !participant.finishedAt) {
				participant.finishedAt = now;
				participant.rank = this.getNextRank();
			}
		}
	}

	public getParticipantFinalStats(
		socketId: string,
		replayData: { key: string; timestamp: number }[],
	) {
		const participant = this._participants.get(socketId);
		if (!participant || !this._raceStartTime) return null;

		const now = Date.now();
		let reconstructedTypedText = '';
		for (const event of replayData) {
			if (event.key === 'Backspace') {
				reconstructedTypedText = reconstructedTypedText.slice(0, -1);
			} else if (event.key.length === 1) {
				reconstructedTypedText += event.key;
			}
		}

		const targetText = this._text.join(' ');
		const accuracy = this.calculateAccuracy(reconstructedTypedText, targetText);
		const wpm = this.calculateWPM(
			reconstructedTypedText.length,
			this._raceStartTime,
			now,
		);

		return {
			wpm,
			raw: wpm,
			accuracy,
		};
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

	private calculateWPM(
		typedLength: number,
		startTime: number,
		now: number,
	): number {
		const timeMinutes = (now - startTime) / 60000;
		const charactersPerWord = 5;
		const words = typedLength / charactersPerWord;
		return timeMinutes > 0 ? words / timeMinutes : 0;
	}

	private calculateAccuracy(typedText: string, targetText: string): number {
		if (typedText.length === 0) return 100;
		let correct = 0;
		const length = Math.min(typedText.length, targetText.length);
		for (let i = 0; i < length; i++) {
			if (typedText[i] === targetText[i]) correct++;
		}
		return Math.round((correct / typedText.length) * 100);
	}

	private calculateProgress(typedLength: number, totalLength: number): number {
		if (totalLength === 0) return 0;
		return Math.min((typedLength / totalLength) * 100, 100);
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