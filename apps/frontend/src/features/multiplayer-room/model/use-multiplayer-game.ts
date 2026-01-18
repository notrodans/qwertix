import { caretPosAtom, resetTyping } from '@/entities/typing-text';
import { type MultiplayerModel } from './multiplayer-factory';

export function useMultiplayerGame(model: MultiplayerModel) {
	return {
		userTyped: model.userTypedAtom(),
		validLength: model.validLengthAtom(),
		caretPos: caretPosAtom(),
		timeLeft: model.mpTimeLeftAtom(),
		isFocused: model.mpIsFocusedAtom(),
		localResult: model.mpLocalResultAtom(),
		clearLocalResult: model.clearLocalResult,
		reset: resetTyping,
	};
}
