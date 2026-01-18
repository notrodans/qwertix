import { env } from '@env';
import {
	calculateAccuracy,
	calculateCorrectCharacters,
	calculateResultHash,
	calculateWPM,
	RaceModeEnum,
	type ReplayEvent,
	reconstructText,
} from '@qwertix/room-contracts';
import {
	action,
	atom,
	effect,
	withAsync,
	withConnectHook,
	wrap,
} from '@reatom/core';
import { tokenAtom, userAtom } from '@/entities/session';
import {
	checkCompletion,
	isTypingEnabledAtom,
	replayDataAtom,
	resetTyping,
	startTimeAtom,
	targetTextAtom,
	userTypedAtom,
} from '@/entities/typing-text';
import {
	type Durations,
	durationAtom,
	modeAtom,
	SoloStatusEnum,
	setStatus,
	statusAtom,
	type WordCounts,
	wordCountAtom,
} from './store';

export interface SoloGameResult {
	wpm: number;
	raw: number;
	accuracy: number;
	consistency: number;
	replayData: ReplayEvent[];
	fullText: string;
	afkDuration: number;
}

// State
export const timeLeftAtom = atom<number | null>(null, 'solo.timeLeft');
export const resultsAtom = atom<SoloGameResult | null>(null, 'solo.results');
export const wordsAtom = atom<string[]>([], 'solo.words');
export const extraWordsAtom = atom<string[]>([], 'solo.extraWords');
export const isSavingAtom = atom(false, 'solo.isSaving');
export const isFocusedAtom = atom(true, 'solo.isFocused');
export const afkDurationAtom = atom(0, 'solo.afkDuration');
const lastInputTimeAtom = atom(0, 'solo.lastInputTime');
const blurStartTimeAtom = atom<number | null>(null, 'solo.blurStartTime');
const activeTimerIntervalAtom = atom<ReturnType<typeof setInterval> | null>(
	null,
	'solo.activeTimerInterval',
);

// Unified Stop Timer utility
const stopActiveTimer = action(() => {
	const interval = activeTimerIntervalAtom();
	if (interval) {
		clearInterval(interval);
		activeTimerIntervalAtom.set(null);
	}
}, 'solo.stopActiveTimer');

// Actions
export const fetchWords = action(async (count: number) => {
	try {
		const response = await wrap(fetch(`/api/words?count=${count}`));
		if (response.ok) {
			const newWords = await wrap(response.json());
			return newWords;
		}
	} catch (e) {
		console.error('Failed to fetch words', e);
	}
	return [];
}, 'solo.fetchWords');

export const initializeGame = action(async () => {
	stopActiveTimer();
	isTypingEnabledAtom.set(false);
	resetTyping();

	const mode = modeAtom();
	const duration = durationAtom();
	timeLeftAtom.set(mode === RaceModeEnum.TIME ? duration : null);
	resultsAtom.set(null);
	afkDurationAtom.set(0);
	lastInputTimeAtom.set(0);
	wordsAtom.set([]);
	targetTextAtom.set('');
	setStatus(SoloStatusEnum.START);

	const count = mode === RaceModeEnum.WORDS ? wordCountAtom() : 50;
	try {
		const initialWords = await wrap(fetchWords(count));
		wordsAtom.set(initialWords);
		extraWordsAtom.set([]);
		targetTextAtom.set(initialWords.join(' '));
	} finally {
		// Re-enable typing only after we are ready
		isTypingEnabledAtom.set(true);
	}
}, 'solo.initializeGame');

export const stopSoloGame = action(() => {
	stopActiveTimer();
	setStatus(SoloStatusEnum.OFF);
	resetTyping();
}, 'solo.stopSoloGame');

export const restartGame = action(async () => {
	await wrap(initializeGame());
}, 'solo.restartGame').extend(withAsync());

export const setMode = action(async (mode: RaceModeEnum) => {
	modeAtom.set(mode);
	await wrap(initializeGame());
}, 'solo.setMode').extend(withAsync());

export const setDuration = action(async (duration: Durations) => {
	durationAtom.set(duration);
	await wrap(initializeGame());
}, 'solo.setDuration').extend(withAsync());

export const setWordCount = action(async (wordCount: WordCounts) => {
	wordCountAtom.set(wordCount);
	await wrap(initializeGame());
}, 'solo.setWordCount').extend(withAsync());

export const exitToIdle = action(() => {
	if (statusAtom() === SoloStatusEnum.TYPING) {
		stopActiveTimer();
		isTypingEnabledAtom.set(false);
		blurStartTimeAtom.set(Date.now());
		setStatus(SoloStatusEnum.IDLE);
	}
}, 'solo.exitToIdle');

export const resumeFromIdle = action(() => {
	if (statusAtom() === SoloStatusEnum.IDLE) {
		isFocusedAtom.set(true);
		const blurStart = blurStartTimeAtom();
		if (blurStart) {
			const pauseDuration = Date.now() - blurStart;
			const start = startTimeAtom();
			if (start) {
				startTimeAtom.set(start + pauseDuration);
			}
			afkDurationAtom.set((prev) => prev + pauseDuration);
			blurStartTimeAtom.set(null);
			lastInputTimeAtom.set(Date.now());
		}
		isTypingEnabledAtom.set(true);
		setStatus(SoloStatusEnum.TYPING);
	}
}, 'solo.resumeFromIdle');

export const toggleIdle = action(() => {
	const status = statusAtom();
	if (status === SoloStatusEnum.TYPING) {
		exitToIdle();
	} else if (status === SoloStatusEnum.IDLE) {
		resumeFromIdle();
	}
}, 'solo.toggleIdle');

const saveResult = action(
	async (result: {
		userId?: string;
		targetText: string;
		replayData: ReplayEvent[];
		startTime: number;
		endTime: number;
		consistency: number;
		afkDuration: number;
	}) => {
		isSavingAtom.set(true);
		try {
			const reconstructed = reconstructText(result.replayData);
			const correctChars = calculateCorrectCharacters(
				reconstructed,
				result.targetText,
			);
			const wpm = Math.round(
				calculateWPM(correctChars, result.startTime, result.endTime),
			);
			const raw = Math.round(
				calculateWPM(reconstructed.length, result.startTime, result.endTime),
			);
			const accuracy = calculateAccuracy(reconstructed, result.targetText);
			const hash = await wrap(
				calculateResultHash(
					wpm,
					raw,
					accuracy,
					result.consistency,
					result.startTime,
					result.endTime,
					result.afkDuration,
					result.targetText,
					env.VITE_RESULT_HASH_SALT,
				),
			);

			const payload = { ...result, wpm, raw, accuracy, hash };
			const token = tokenAtom();
			const headers: Record<string, string> = {
				'Content-Type': 'application/json',
			};
			// TODO: we need client sdk
			if (token) headers.Authorization = `Bearer ${token}`;

			const response = await wrap(
				fetch('/api/results', {
					method: 'POST',
					headers,
					body: JSON.stringify(payload),
				}),
			);

			if (response.ok) {
				const saved = await wrap(response.json());
				resultsAtom.set({
					wpm: saved.wpm,
					raw: saved.raw,
					accuracy: saved.accuracy,
					consistency: saved.consistency,
					replayData: result.replayData,
					fullText: result.targetText,
					afkDuration: result.afkDuration,
				});
			} else {
				resultsAtom.set({
					wpm,
					raw,
					accuracy,
					consistency: result.consistency,
					replayData: result.replayData,
					fullText: result.targetText,
					afkDuration: result.afkDuration,
				});
			}
		} catch (e) {
			console.error('Failed to save result', e);
		} finally {
			isSavingAtom.set(false);
		}
	},
	'solo.saveResult',
);

export const finishGame = action(() => {
	if (statusAtom() !== SoloStatusEnum.TYPING) return;
	stopActiveTimer();
	isTypingEnabledAtom.set(false);

	const endTime = Date.now();
	const startTime = startTimeAtom() || 0;
	const text = targetTextAtom();
	const replay = replayDataAtom();
	const user = userAtom();
	const afk = afkDurationAtom();
	const lastInput = lastInputTimeAtom();

	const finalGap = endTime - lastInput;
	const finalAfk = finalGap > 5000 ? afk + finalGap : afk;

	setStatus(SoloStatusEnum.RESULT);

	saveResult({
		targetText: text,
		consistency: 100,
		replayData: replay,
		afkDuration: finalAfk,
		userId: user?.id,
		startTime,
		endTime,
	});
}, 'solo.finishGame');

// Connected Listener Atom
export const soloListenerAtom = atom(null, 'solo.listener');
soloListenerAtom.extend(
	withConnectHook(() => {
		const handleBlur = () => exitToIdle();
		const handleFocus = () => isFocusedAtom.set(true);
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				toggleIdle();
			}
		};

		window.addEventListener('blur', handleBlur);
		window.addEventListener('focus', handleFocus);
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('blur', handleBlur);
			window.removeEventListener('focus', handleFocus);
			window.removeEventListener('keydown', handleKeyDown);
		};
	}),
);

// Effects

// 1. Sync Text
effect(() => {
	const words = wordsAtom();
	const extra = extraWordsAtom();
	targetTextAtom.set([...words, ...extra].join(' '));
});

// 2. Monitor Typing Start
effect(() => {
	const start = startTimeAtom();
	const status = statusAtom();
	if (start && status === SoloStatusEnum.START) {
		setStatus(SoloStatusEnum.TYPING);
		lastInputTimeAtom.set(Date.now());
		afkDurationAtom.set(0);
	}
});

// 3. Monitor Timer
effect(() => {
	const status = statusAtom();
	const mode = modeAtom();
	const duration = durationAtom();
	const start = startTimeAtom();

	if (
		status !== SoloStatusEnum.TYPING ||
		mode !== RaceModeEnum.TIME ||
		!start
	) {
		stopActiveTimer();
		return;
	}

	stopActiveTimer();
	const interval = setInterval(() => {
		if (statusAtom() !== SoloStatusEnum.TYPING) {
			stopActiveTimer();
			return;
		}

		const elapsed = (Date.now() - start) / 1000;
		const remaining = Math.max(0, duration - elapsed);
		const nextTime = Math.ceil(remaining);

		if (timeLeftAtom() !== nextTime) timeLeftAtom.set(nextTime);

		if (remaining <= 0) {
			stopActiveTimer();
			finishGame();
		}
	}, 100);
	activeTimerIntervalAtom.set(interval);

	return () => stopActiveTimer();
});

// 4. Monitor Typing Progress
effect(() => {
	const userTyped = userTypedAtom();
	const text = targetTextAtom();
	const mode = modeAtom();
	const status = statusAtom();

	if (status !== SoloStatusEnum.TYPING) return;

	const now = Date.now();
	const last = lastInputTimeAtom();
	if (last > 0 && userTyped.length > 0) {
		const gap = now - last;
		if (gap > 5000) afkDurationAtom.set((prev) => prev + gap);
		lastInputTimeAtom.set(now);
	}

	if (mode === RaceModeEnum.TIME && text.length - userTyped.length < 150) {
		fetchWords(50).then((newWords) => {
			extraWordsAtom.set((prev) => [...prev, ...newWords]);
		});
	}

	if (
		mode === RaceModeEnum.WORDS &&
		checkCompletion(userTyped, text) &&
		text.length > 0
	) {
		finishGame();
	}
});

// 5. Manage Typing Enabled State
effect(() => {
	const status = statusAtom();
	if (status === SoloStatusEnum.OFF) {
		isTypingEnabledAtom.set(true);
		return;
	}
	const isEnabled =
		status === SoloStatusEnum.START || status === SoloStatusEnum.TYPING;
	if (isEnabled && !isTypingEnabledAtom()) return;
	isTypingEnabledAtom.set(isEnabled);
});
