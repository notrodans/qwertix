import {
	type ReplayEvent,
	type RoomConfig,
	type RoomStatus,
} from '@qwertix/room-contracts';
import { RaceStrategyFactory } from '@/factories/race-strategy-factory';
import type { IRaceRulesStrategy } from '../../strategies/base-rule-strategy';
import {
	calculateAccuracy,
	calculateWPM,
	reconstructText,
} from '../typing-logic';
import { ParticipantEntity } from './participant.entity';

export class Room {
	private _participants: Map<string, ParticipantEntity> = new Map();
	private _status: RoomStatus = 'LOBBY';
	private _raceStartTime: number | null = null;
	private _text: string[];
	private _strategy: IRaceRulesStrategy;
	private _raceStrategyFactory: RaceStrategyFactory;

	constructor(
		private readonly _id: string,
		private _config: RoomConfig,
		initialText: string[],
		private _presetId: number | null = null,
	) {
		this._text = initialText;
		this._raceStrategyFactory = new RaceStrategyFactory();
		this._strategy = this._raceStrategyFactory.getStrategy(_config);
	}

	id(): string {
		return this._id;
	}

	presetId(): number | null {
		return this._presetId;
	}

	participants(): Map<string, ParticipantEntity> {
		return this._participants;
	}

	status(): RoomStatus {
		return this._status;
	}

	config(): RoomConfig {
		return this._config;
	}

	raceStartTime(): number | null {
		return this._raceStartTime;
	}

	text(): string[] {
		return this._text;
	}

	addParticipant(socketId: string, username: string): ParticipantEntity {
		if (this._status === 'RACING') {
			throw new Error('Cannot join racing room');
		}
		const isHost = this._participants.size === 0;
		const participant = new ParticipantEntity(socketId, username, isHost);
		this._participants.set(socketId, participant);
		return participant;
	}

	removeParticipant(socketId: string): void {
		this._participants.delete(socketId);
		this.reassignHostIfNeeded();
	}

	private reassignHostIfNeeded(): void {
		if (this._participants.size > 0) {
			const hasHost = Array.from(this._participants.values()).some(
				(p) => p.isHost,
			);
			if (!hasHost) {
				const nextHost = this._participants.values().next().value;
				if (nextHost) nextHost.isHost = true;
			}
		}
	}

	startRace(): void {
		if (this._participants.size < 1) throw new Error('Not enough players');
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
		for (const participant of this._participants.values()) {
			participant.reset();
		}
	}

	transferHost(targetId: string): boolean {
		const target = this._participants.get(targetId);
		if (!target) return false;

		for (const participant of this._participants.values()) {
			participant.isHost = false;
		}
		target.isHost = true;
		return true;
	}

	getParticipantFinalStats(socketId: string, replayData: ReplayEvent[]) {
		const participant = this._participants.get(socketId);
		if (!participant || !this._raceStartTime) return null;

		const targetText = this._text.join(' ');
		const reconstructed = reconstructText(replayData);
		const endTime = Date.now();

		const wpm = calculateWPM(
			reconstructed.length,
			this._raceStartTime,
			endTime,
		);
		const accuracy = calculateAccuracy(reconstructed, targetText);

		return {
			wpm: wpm,
			raw: wpm, // Simplified for now
			accuracy,
		};
	}

	updateParticipantStats(
		socketId: string,
		stats: { wpm: number; accuracy: number },
	): void {
		const participant = this._participants.get(socketId);
		if (participant) {
			participant.updateStats(stats.wpm, stats.accuracy);
		}
	}

	updateParticipantProgress(socketId: string, typedLength: number): void {
		if (this._status !== 'RACING' || !this._raceStartTime) return;

		const participant = this._participants.get(socketId);
		if (!participant) return;

		const now = Date.now();
		const totalLen = this._text.join(' ').length;

		const progress = this._strategy.calculateProgress(
			typedLength,
			totalLen,
			this._raceStartTime,
		);
		const wpm = calculateWPM(typedLength, this._raceStartTime, now);

		participant.updateProgress(progress);
		participant.updateStats(wpm, participant.stats().accuracy);

		if (
			this._strategy.isFinished(
				participant.stats(),
				this._config,
				this._raceStartTime,
			)
		) {
			const rank = this.getNextRank();
			participant.markFinished(rank, now);
			this.checkAllFinished();
		}
	}

	private getNextRank(): number {
		return (
			Array.from(this._participants.values()).filter((p) => p.rank !== null)
				.length + 1
		);
	}

	private checkAllFinished(): void {
		const allFinished = Array.from(this._participants.values()).every(
			(p) => p.finishedAt !== null,
		);
		if (allFinished) {
			this._status = 'FINISHED';
		}
	}

	updateConfig(config: RoomConfig, newText: string[]): void {
		if (this._status !== 'LOBBY')
			throw new Error('Can only change config in Lobby');
		this._config = config;
		this._text = newText;
		this._strategy = this._raceStrategyFactory.getStrategy(config);
	}

	toDTO() {
		return {
			id: this._id,
			status: this._status,
			participants: Array.from(this._participants.values()).map((p) =>
				p.toDTO(),
			),
			config: this._config,
			text: this._text,
		};
	}
}
