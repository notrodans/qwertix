import { action, atom, withConnectHook } from '@reatom/core';
import {
	appendCharacter,
	calculateBackspace,
	calculateCursorIndex,
	checkWordCompletion,
} from '../domain/typing-engine';

export const userTypedAtom = atom('', 'userTyped');
export const targetTextAtom = atom('', 'targetText');
export const caretPosAtom = atom({ top: 0, left: 0 }, 'caretPos');
export const cursorIndexAtom = atom(0, 'cursorIndex');
export const replayDataAtom = atom<
	{
		key: string;
		timestamp: number;
		ctrlKey?: boolean;
		confirmedIndex?: number;
	}[]
>([], 'replayData');
export const startTimeAtom = atom<number | null>(null, 'startTime');
export const validLengthAtom = atom(0, 'validLength');
export const isTypingEnabledAtom = atom(true, 'isTypingEnabled');

export const setCaretPos = action((pos: { top: number; left: number }) => {
	caretPosAtom.set(pos);
}, 'setCaretPos');

export const resetTyping = action(() => {
	userTypedAtom.set('');
	cursorIndexAtom.set(0);
	replayDataAtom.set([]);
	startTimeAtom.set(null);
	validLengthAtom.set(0);
	caretPosAtom.set({ left: 0, top: 0 });
}, 'resetTyping');

export const handleKeydown = action((event: KeyboardEvent) => {
	if (!isTypingEnabledAtom()) return;
	if (event.altKey) return;
	if ((event.ctrlKey || event.metaKey) && event.key !== 'Backspace') return;

	// Prevent scrolling on Space and default browser actions on Backspace
	if (event.key === ' ' || event.key === 'Backspace') {
		event.preventDefault();
	}

	const currentTyped = userTypedAtom();
	const targetText = targetTextAtom();
	let nextTyped = currentTyped;

	if (event.key === 'Backspace') {
		nextTyped = calculateBackspace(
			currentTyped,
			validLengthAtom(),
			event.ctrlKey || event.metaKey,
		);
	} else if (event.key.length === 1) {
		// Start timer on first key
		if (!startTimeAtom()) {
			startTimeAtom.set(Date.now());
		}
		nextTyped = appendCharacter(currentTyped, event.key, targetText);

		// Handle word completion on space
		if (event.key === ' ') {
			const newConfirmed = checkWordCompletion(nextTyped, targetText);
			if (newConfirmed !== -1) {
				validLengthAtom.set(newConfirmed);
			}
		}
	}

	if (nextTyped !== currentTyped) {
		userTypedAtom.set(nextTyped);
		const index = calculateCursorIndex(targetText, nextTyped);
		cursorIndexAtom.set(index);

		// Record replay
		const start = startTimeAtom() || Date.now();
		replayDataAtom.set([
			...replayDataAtom(),
			{
				key: event.key,
				timestamp: Date.now() - start,
				ctrlKey: event.ctrlKey || event.metaKey,
				confirmedIndex: validLengthAtom(),
			},
		]);
	}
}, 'handleKeydown');

export const typingListenerAtom = atom(null, 'typingListener');

typingListenerAtom.extend(
	withConnectHook(() => {
		const listener = (e: KeyboardEvent) => handleKeydown(e);
		window.addEventListener('keydown', listener);
		return () => window.removeEventListener('keydown', listener);
	}),
);

export { appendCharacter };
