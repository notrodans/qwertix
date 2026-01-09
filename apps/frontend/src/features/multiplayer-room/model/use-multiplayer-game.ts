import {
	caretPosAtom,
	resetTyping,
	userTypedAtom,
	validLengthAtom,
} from '@/entities/typing-text';
import {
	clearLocalResult,
	mpIsFocusedAtom,
	mpLocalResultAtom,
	mpTimeLeftAtom,
} from './multiplayer-game-model';

// This hook is now just a selector for atoms, used in MultiplayerRoomMediator
export { clearLocalResult };
export function useMultiplayerGame() {
	return {
		userTyped: userTypedAtom(),
		validLength: validLengthAtom(),
		caretPos: caretPosAtom(),
		timeLeft: mpTimeLeftAtom(),
		isFocused: mpIsFocusedAtom(),
		localResult: mpLocalResultAtom(),
		// containerRef logic is moved to mediator/component
		reset: resetTyping,
	};
}
