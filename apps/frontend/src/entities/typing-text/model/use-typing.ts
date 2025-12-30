import { type RefObject, useCallback, useEffect, useState } from 'react';
import {
	appendCharacter,
	calculateBackspace,
	calculateCursorIndex,
	checkWordCompletion,
} from '../domain/typing-engine';
import { useCursorPositioning } from './use-cursor-positioning';

export function useTyping(
	targetText: string,
	containerRef: RefObject<HTMLElement | null>,
) {
	const [userTyped, setUserTyped] = useState('');
	const [confirmedIndex, setConfirmedIndex] = useState(0);
	const [caretPos, setCaretPos] = useState({ left: 0, top: 0 });
	const [replayData, setReplayData] = useState<
		{ key: string; timestamp: number }[]
	>([]);
	const [startTime, setStartTime] = useState<number | null>(null);

	const updateCursor = useCursorPositioning(containerRef, setCaretPos);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			// Ignore if modifier keys are pressed (except Shift and Ctrl/Meta for Backspace)
			if (event.altKey) return;
			if ((event.ctrlKey || event.metaKey) && event.key !== 'Backspace') return;

			if (!startTime) setStartTime(Date.now());
			const timestamp = Date.now() - (startTime || Date.now());

			if (event.key === 'Backspace') {
				setReplayData((prev) => [...prev, { key: 'Backspace', timestamp }]);
				const next = calculateBackspace(
					userTyped,
					confirmedIndex,
					event.ctrlKey || event.metaKey,
				);
				setUserTyped(next);

				const nextIndex = calculateCursorIndex(targetText, next);
				requestAnimationFrame(() => updateCursor(nextIndex));
				return;
			}

			if (event.key.length === 1) {
				// Prevent default action for space to avoid scrolling
				if (event.key === ' ') {
					event.preventDefault();
				}

				setReplayData((prev) => [
					...prev,
					{ key: event.key, timestamp: Date.now() - (startTime || Date.now()) },
				]);

				const next = appendCharacter(userTyped, event.key);

				// If input didn't change (invalid space), do nothing
				if (next === userTyped) return;

				setUserTyped(next);

				// Check word completion if space was typed
				if (event.key === ' ') {
					const newConfirmedIndex = checkWordCompletion(next, targetText);
					if (newConfirmedIndex !== null) {
						setConfirmedIndex(newConfirmedIndex);
					}
				}

				const nextIndex = calculateCursorIndex(targetText, next);
				requestAnimationFrame(() => updateCursor(nextIndex));
			}
		},
		[targetText, confirmedIndex, updateCursor, userTyped],
	);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleKeyDown]);

	const reset = useCallback(() => {
		setUserTyped('');
		setConfirmedIndex(0);
		// Reset cursor
		requestAnimationFrame(() => updateCursor(0));
	}, [updateCursor]);

	return {
		userTyped,
		caretPos,
		reset,
		replayData,
	};
}
