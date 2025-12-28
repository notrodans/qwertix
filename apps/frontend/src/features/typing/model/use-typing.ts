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

	const updateCursor = useCursorPositioning(containerRef, setCaretPos);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			// Ignore if modifier keys are pressed (except Shift and Ctrl/Meta for Backspace)
			if (event.altKey) return;
			if ((event.ctrlKey || event.metaKey) && event.key !== 'Backspace') return;

			if (event.key === 'Backspace') {
				setUserTyped((prev) => {
					const next = calculateBackspace(
						prev,
						confirmedIndex,
						event.ctrlKey || event.metaKey,
					);
					const nextIndex = calculateCursorIndex(targetText, next);
					requestAnimationFrame(() => updateCursor(nextIndex));
					return next;
				});
				return;
			}

			if (event.key.length === 1) {
				// Prevent default action for space to avoid scrolling
				if (event.key === ' ') {
					event.preventDefault();
				}

				setUserTyped((prev) => {
					const next = appendCharacter(prev, event.key);

					// If input didn't change (invalid space), return prev
					if (next === prev) return prev;

					// Check word completion if space was typed
					if (event.key === ' ') {
						const newConfirmedIndex = checkWordCompletion(next, targetText);
						if (newConfirmedIndex !== null) {
							setConfirmedIndex(newConfirmedIndex);
						}
					}

					const nextIndex = calculateCursorIndex(targetText, next);
					requestAnimationFrame(() => updateCursor(nextIndex));

					return next;
				});
			}
		},
		[targetText, confirmedIndex, updateCursor],
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

	const cursorIndex = calculateCursorIndex(targetText, userTyped);

	// Also trigger cursor update on initial load or targetText change
	// This replaces the effect... mostly. But on first render refs might be null.
	// We might need a simplistic effect to catch the "mounted" state?
	useEffect(() => {
		// Wait for mount
		requestAnimationFrame(() => updateCursor(cursorIndex));
	}, [updateCursor, cursorIndex]);

	return {
		userTyped,
		cursorIndex,
		caretPos,
		reset,
	};
}
