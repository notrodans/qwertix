import {
	caretPosAtom,
	targetTextAtom,
	userTypedAtom,
} from '@/entities/typing-text';
import {
	exitToIdle,
	initializeGame,
	isSavingAtom,
	restartGame,
	resultsAtom,
	resumeFromIdle,
	soloListenerAtom,
	stopSoloGame,
	timeLeftAtom,
	toggleIdle,
} from './solo-model';
import { durationAtom, modeAtom, statusAtom, wordCountAtom } from './store';

export function useSoloGame() {
	return {
		status: statusAtom(),
		mode: modeAtom(),
		duration: durationAtom(),
		wordCount: wordCountAtom(),
		timeLeft: timeLeftAtom(),
		results: resultsAtom(),
		text: targetTextAtom(),
		userTyped: userTypedAtom(),
		caretPos: caretPosAtom(),
		isSaving: isSavingAtom(),
		restart: restartGame,
		initialize: initializeGame,
		stop: stopSoloGame,
		resumeFromIdle,
		exitToIdle,
		toggleIdle,
		listener: soloListenerAtom(),
	};
}
