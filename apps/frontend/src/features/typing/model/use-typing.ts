import { useCallback, useEffect, useState } from 'react';
import {
	appendCharacter,
	calculateBackspace,
	checkWordCompletion,
} from '../domain/typing-engine';

export function useTyping(targetText: string) {
	const [userTyped, setUserTyped] = useState('');
	const [confirmedIndex, setConfirmedIndex] = useState(0);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			// Ignore if modifier keys are pressed (except Shift and Ctrl/Meta for Backspace)
			if (event.altKey) return;
			if ((event.ctrlKey || event.metaKey) && event.key !== 'Backspace') return;

			if (event.key === 'Backspace') {
				setUserTyped((prev) =>
					calculateBackspace(
						prev,
						confirmedIndex,
						event.ctrlKey || event.metaKey,
					),
				);
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

					return next;
				});
			}
		},
		[targetText, confirmedIndex],
	);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleKeyDown]);

	const reset = useCallback(() => {
		setUserTyped('');
		setConfirmedIndex(0);
	}, []);

	return {
		userTyped,
		reset,
	};
}
