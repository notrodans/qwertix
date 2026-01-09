import {
	RaceModeEnum,
	type ReplayEvent,
	RoomStatusEnum,
} from '@qwertix/room-contracts';
import { action, atom, effect } from '@reatom/core';
import {
	checkCompletion,
	replayDataAtom,
	resetTyping,
	targetTextAtom,
	userTypedAtom,
	validLengthAtom,
} from '@/entities/typing-text';
import {
	loadMoreWords,
	roomAtom,
	submitResult,
	updateProgress,
} from './multiplayer-model';

// State
export const mpIsFocusedAtom = atom(true, 'mpGame.isFocused');
export const mpTimeLeftAtom = atom<number | null>(null, 'mpGame.timeLeft');
export const mpSubmittedAtom = atom(false, 'mpGame.submitted');
export const mpStartTimeLocalAtom = atom<number | null>(
	null,
	'mpGame.startTimeLocal',
);
// Store local result for optimistic display
export const mpLocalResultAtom = atom<{
	wpm: number;
	raw: number;
	accuracy: number;
	consistency: number;
	afkDuration: number;
	replayData: ReplayEvent[];
} | null>(null, 'mpGame.localResult');

const mpLastInputTimeAtom = atom(0, 'mpGame.lastInputTime');
const mpAfkDurationAtom = atom(0, 'mpGame.afkDuration');
const mpBlurStartTimeAtom = atom<number | null>(null, 'mpGame.blurStartTime');

// Actions
export const clearLocalResult = action(() => {
	mpLocalResultAtom.set(null);
}, 'mpGame.clearLocalResult');

export const handleMpFinish = action(() => {
	const submitted = mpSubmittedAtom();
	if (submitted) return;
	console.log('Multiplayer Finish called');

	const replay = replayDataAtom();
	const afk = mpAfkDurationAtom();
	const lastInput = mpLastInputTimeAtom();

	const endTime = Date.now();
	const finalGap = endTime - lastInput;
	const finalAfk = finalGap > 5000 ? afk + finalGap : afk;

	const stats = {
		wpm: 0,
		raw: 0,
		accuracy: 0,
		consistency: 100,
		replayData: replay,
		afkDuration: finalAfk,
	};

	console.log('Submitting Multiplayer Result:', stats);
	mpLocalResultAtom.set(stats);
	submitResult(stats);

	mpSubmittedAtom.set(true);
}, 'mpGame.handleFinish');

// Effects ...

// 1. Sync Text from Room
effect(() => {
	const room = roomAtom();
	if (room) {
		// Only update if text length changed to avoid reset on every room update
		const newText = room.text.join(' ');
		if (targetTextAtom() !== newText) {
			targetTextAtom.set(newText);
		}
	}
});

// 2. React to Room Status
effect(() => {
	const room = roomAtom();
	if (!room) return;

	const status = room.status;
	const startTimeLocal = mpStartTimeLocalAtom();
	const submitted = mpSubmittedAtom();

	if (status === RoomStatusEnum.RACING && !startTimeLocal) {
		const now = Date.now();
		mpStartTimeLocalAtom.set(now);
		mpLastInputTimeAtom.set(now);
		mpAfkDurationAtom.set(0);
		mpIsFocusedAtom.set(true);
		// Also ensure typing is reset? or maybe we keep what was typed in countdown?
		// Usually reset on start.
	} else if (status === RoomStatusEnum.FINISHED && !submitted) {
		handleMpFinish();
	} else if (status === RoomStatusEnum.LOBBY) {
		mpSubmittedAtom.set(false);
		mpLocalResultAtom.set(null);
		mpTimeLeftAtom.set(null);
		mpStartTimeLocalAtom.set(null);
		resetTyping();
		mpAfkDurationAtom.set(0);
		mpIsFocusedAtom.set(true);
	}
});

// 3. Progress Update (Throttled)
let lastProgressUpdate = 0;
effect(() => {
	const validLength = validLengthAtom();
	const userTyped = userTypedAtom();
	const text = targetTextAtom();
	const room = roomAtom();
	const submitted = mpSubmittedAtom();

	if (room?.status === RoomStatusEnum.RACING && !submitted) {
		const now = Date.now();
		const isEnd = text.length > 0 && checkCompletion(userTyped, text);
		const progress = isEnd ? userTyped.length : validLength;

		if (isEnd || now - lastProgressUpdate > 200) {
			updateProgress(progress);
			lastProgressUpdate = now;
		}
	}
});

// 4. Load More Words & AFK Tracking on Type
effect(() => {
	const userTyped = userTypedAtom(); // subscribe
	const text = targetTextAtom();
	const room = roomAtom();
	const submitted = mpSubmittedAtom();

	if (!room || submitted) return;

	const now = Date.now();
	const lastInput = mpLastInputTimeAtom();

	if (room.status === RoomStatusEnum.RACING && lastInput > 0) {
		const gap = now - lastInput;
		if (gap > 5000) {
			mpAfkDurationAtom.set((prev) => prev + gap);
		}
		mpLastInputTimeAtom.set(now);
	}

	if (text.length > 200 && text.length - userTyped.length < 150) {
		loadMoreWords();
	}
});

// 5. Timer
effect(() => {
	const startTimeLocal = mpStartTimeLocalAtom();
	const room = roomAtom();

	if (
		startTimeLocal &&
		room?.config.mode === RaceModeEnum.TIME &&
		'duration' in room.config &&
		room.config.duration
	) {
		const duration = room.config.duration;

		const interval = setInterval(() => {
			const elapsed = (Date.now() - startTimeLocal) / 1000;
			const remaining = Math.max(0, duration - elapsed);
			mpTimeLeftAtom.set(Math.ceil(remaining));
		}, 1000);

		return () => clearInterval(interval);
	}

	return;
});

// 6. Focus/Blur
effect(() => {
	const handleBlur = () => {
		const room = roomAtom();
		if (room?.status === RoomStatusEnum.RACING) {
			mpIsFocusedAtom.set(false);
			mpBlurStartTimeAtom.set(Date.now());
		}
	};

	const handleFocus = () => {
		const room = roomAtom();
		if (room?.status === RoomStatusEnum.RACING) {
			mpIsFocusedAtom.set(true);
			const blurStart = mpBlurStartTimeAtom();
			if (blurStart) {
				const duration = Date.now() - blurStart;
				mpAfkDurationAtom.set((prev) => prev + duration);
				mpBlurStartTimeAtom.set(null);
				mpLastInputTimeAtom.set(Date.now());
			}
		}
	};

	window.addEventListener('blur', handleBlur);
	window.addEventListener('focus', handleFocus);
	return () => {
		window.removeEventListener('blur', handleBlur);
		window.removeEventListener('focus', handleFocus);
	};
});
