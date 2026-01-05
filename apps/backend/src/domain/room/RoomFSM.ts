import { RoomStatusEnum } from '@qwertix/room-contracts';
import { DomainException } from '@/exceptions/DomainException';

/**
 * Finite State Machine for managing Room states.
 * Enforces valid transitions and provides a single source of truth for state logic.
 */
export class RoomFSM {
	private _state: RoomStatusEnum;

	constructor(initialState: RoomStatusEnum = RoomStatusEnum.LOBBY) {
		this._state = initialState;
	}

	/**
	 * Gets the current state.
	 */
	get state(): RoomStatusEnum {
		return this._state;
	}

	/**
	 * Attempts to transition the room to a new state.
	 * @param newState - The target state.
	 * @throws DomainException if the transition is invalid.
	 */
	transitionTo(newState: RoomStatusEnum): void {
		if (!this.canTransitionTo(newState)) {
			throw new DomainException(
				`Invalid state transition from ${RoomStatusEnum[this._state]} to ${RoomStatusEnum[newState]}`,
			);
		}
		this._state = newState;
	}

	/**
	 * Checks if a transition to the target state is valid.
	 * @param newState - The target state.
	 */
	canTransitionTo(newState: RoomStatusEnum): boolean {
		if (this._state === newState) return true; // No-op transition is strictly "valid" or ignored

		switch (this._state) {
			case RoomStatusEnum.LOBBY:
				// Lobby -> Countdown (Start Race triggered)
				return newState === RoomStatusEnum.COUNTDOWN;

			case RoomStatusEnum.COUNTDOWN:
				// Countdown -> Racing (Timer finished)
				// Countdown -> Lobby (Cancelled by host)
				return (
					newState === RoomStatusEnum.RACING ||
					newState === RoomStatusEnum.LOBBY
				);

			case RoomStatusEnum.RACING:
				// Racing -> Finished (Race over)
				// Racing -> Lobby (Force stop/restart)
				return (
					newState === RoomStatusEnum.FINISHED ||
					newState === RoomStatusEnum.LOBBY
				);

			case RoomStatusEnum.FINISHED:
				// Finished -> Lobby (Play again)
				return newState === RoomStatusEnum.LOBBY;

			default:
				return false;
		}
	}
}
