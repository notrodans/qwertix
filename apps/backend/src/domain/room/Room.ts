import {
	RaceModeEnum,
	type ReplayEvent,
	type RoomConfig,
	RoomStatusEnum,
} from '@qwertix/room-contracts';
import { v4 as uuid } from 'uuid';
import { DomainException } from '@/exceptions/DomainException';
import { RaceStrategyFactory } from '@/factories/RaceStrategyFactory';
import { Participant } from './Participant';
import {
	calculateAccuracy,
	calculateWPM,
	reconstructText,
} from './services/typing-logic';
import type { IRaceRulesStrategy } from './strategies/BaseRuleStrategy';

/**
 * Represents a game room where races take place.
 */
export class Room {
	private readonly _id: string;
	private _participants: Map<string, Participant> = new Map();
	private _status: RoomStatusEnum = RoomStatusEnum.LOBBY;
	private _raceStartTime: number | null = null;
	private _text: string[];
	private strategy: IRaceRulesStrategy;
	private raceStrategyFactory: RaceStrategyFactory;

	constructor(
		private _config: RoomConfig,
		initialText: string[],
		private _presetId: number | null = null,
	) {
		this._id = uuid().substring(0, 6).toUpperCase();
		this._text = initialText;
		this.raceStrategyFactory = new RaceStrategyFactory();
		this.strategy = this.raceStrategyFactory.getStrategy(_config);
	}

	/**
	 * Gets the room ID.
	 */
	id(): string {
		return this._id;
	}

	/**
	 * Gets the preset ID if the room was created from a preset.
	 */
	presetId(): number | null {
		return this._presetId;
	}

	/**
	 * Gets the map of participants in the room.
	 */
	participants(): Map<string, Participant> {
		return this._participants;
	}

	/**
	 * Gets the current status of the room.
	 */
	status(): RoomStatusEnum {
		return this._status;
	}

	/**
	 * Gets the room configuration.
	 */
	config(): RoomConfig {
		return this._config;
	}

	/**
	 * Gets the start time of the race (timestamp).
	 */
	raceStartTime(): number | null {
		return this._raceStartTime;
	}

	/**
	 * Gets the text used for the race.
	 */
	text(): string[] {
		return this._text;
	}

	/**
	 * Adds a participant to the room.
	 * @param socketId - The socket ID of the participant.
	 * @param username - The username of the participant.
	 * @returns The newly created participant.
	 * @throws DomainException if the race is already in progress.
	 */
	addParticipant(socketId: string, username: string): Participant {
		if (this._status === RoomStatusEnum.RACING) {
			throw new DomainException('Cannot join racing room');
		}
		const isHost = this._participants.size === 0;
		const participant = new Participant(socketId, username, isHost);
		this._participants.set(socketId, participant);
		return participant;
	}

	/**
	 * Removes a participant from the room.
	 * @param socketId - The socket ID of the participant to remove.
	 */
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

	/**
	 * Initiates the race start sequence (countdown).
	 * @throws Error if there are not enough players.
	 */
	startRace(): void {
		if (this._participants.size < 1) throw new Error('Not enough players');
		this._status = RoomStatusEnum.COUNTDOWN;
	}

	/**
	 * Starts the race (status becomes RACING).
	 */
	startRacing(): void {
		this._status = RoomStatusEnum.RACING;
		this._raceStartTime = Date.now();
	}

	/**
	 * Finishes the race.
	 */
	finishRacing(): void {
		this._status = RoomStatusEnum.FINISHED;
	}

	/**
	 * Restarts the room with new text.
	 * @param newText - The new text for the next race.
	 */
	restart(newText: string[]): void {
		this._status = RoomStatusEnum.LOBBY;
		this._raceStartTime = null;
		this._text = newText;
		for (const participant of this._participants.values()) {
			participant.reset();
		}
	}

	/**
	 * Transfers host privileges to another participant.
	 * @param targetId - The socket ID of the new host.
	 * @returns True if successful, false if the target user was not found.
	 */
	transferHost(targetId: string): boolean {
		const target = this._participants.get(targetId);
		if (!target) return false;

		for (const participant of this._participants.values()) {
			participant.isHost = false;
		}
		target.isHost = true;
		return true;
	}

	/**
	 * Calculates and returns the final authoritative stats for a participant.
	 * @param socketId - The socket ID of the participant.
	 * @param replayData - The replay data to validate.
	 * @returns The calculated stats, or null if the participant or start time is missing.
	 */
	getParticipantFinalStats(
		socketId: string,
		replayData: ReplayEvent[],
	): {
		wpm: number;
		raw: number; // Simplified for now
		accuracy: number;
	} | null {
		const participant = this._participants.get(socketId);
		if (!participant || !this._raceStartTime) return null;

		const targetText = this._text.join(' ');
		const reconstructed = reconstructText(replayData);
		const endTime = Date.now();

		const wpm = Math.round(
			calculateWPM(reconstructed.length, this._raceStartTime, endTime),
		);
		const accuracy = calculateAccuracy(reconstructed, targetText);

		return {
			wpm: wpm,
			raw: wpm, // Simplified for now
			accuracy,
		};
	}

	/**
	 * Updates a participant's stats directly.
	 * @param socketId - The socket ID.
	 * @param stats - The new stats (wpm, accuracy).
	 */
	updateParticipantStats(
		socketId: string,
		stats: { wpm: number; accuracy: number },
	): void {
		const participant = this._participants.get(socketId);
		if (participant) {
			participant.updateStats(stats.wpm, stats.accuracy);
		}
	}

	/**
	 * Updates a participant's progress based on typed length.
	 * @param socketId - The socket ID.
	 * @param typedLength - The length of typed text.
	 */
	updateParticipantProgress(socketId: string, typedLength: number): void {
		if (this._status !== RoomStatusEnum.RACING || !this._raceStartTime) return;

		const participant = this._participants.get(socketId);
		if (!participant) return;

		const now = Date.now();
		let totalLen = this._text.join(' ').length;

		// Even if we load more words (buffer), the progress should be calculated against the target.
		if (this._config.mode === RaceModeEnum.WORDS) {
			const targetWords = this._text.slice(0, this._config.wordCount);
			totalLen = targetWords.join(' ').length;
		}

		const progress = this.strategy.calculateProgress(
			typedLength,
			totalLen,
			this._raceStartTime,
		);
		const wpm = calculateWPM(typedLength, this._raceStartTime, now);

		participant.updateProgress(progress);
		participant.updateStats(wpm, participant.stats().accuracy);

		if (
			this.strategy.isFinished(
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
			this._status = RoomStatusEnum.FINISHED;
		}
	}

	/**
	 * Updates the room configuration and text.
	 * @param config - The new room configuration.
	 * @param newText - The new text.
	 * @throws DomainException if the room is not in the LOBBY state.
	 */
	updateConfig(config: RoomConfig, newText: string[]): void {
		if (this._status !== RoomStatusEnum.LOBBY)
			throw new DomainException('Can only change config in Lobby');

		this._config = config;
		this._text = newText;
		this.strategy = this.raceStrategyFactory.getStrategy(config);
	}

	/**
	 * Converts the room to a Data Transfer Object.
	 * @returns The RoomDTO.
	 */
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
