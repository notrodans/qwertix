import { useCallback, useEffect, useState } from 'react';

interface UseTypingProps {
	targetText: string;
	enabled?: boolean;
}

export function useTyping({ targetText, enabled = true }: UseTypingProps) {
	const [typed, setTyped] = useState('');
	const [startTime, setStartTime] = useState<number | null>(null);

	// Calculate the index up to which the user is "locked" (cannot backspace)
	// This corresponds to the end of the last correctly typed word.
	const getLockedIndex = useCallback(
		(currentTyped: string) => {
			const words = targetText.split(' ');
			let lockedIndex = 0;

			// We iterate words to find the last fully correct one
			// But wait, we only lock if the user has moved PAST it (i.e., typed the space)
			// Simpler approach: verify word by word against the typed string.

			let currentWordStart = 0;
			for (const word of words) {
				const wordWithSpace = word + ' ';
				// Check if this word (plus space) is fully present and correct in typed string
				if (currentTyped.startsWith(wordWithSpace, currentWordStart)) {
					currentWordStart += wordWithSpace.length;
					lockedIndex = currentWordStart;
				} else {
					// Once we find a mismatch or incomplete word, stop locking
					break;
				}
			}
			return lockedIndex;
		},
		[targetText],
	);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (!enabled) return;

			const { key, ctrlKey, altKey, metaKey } = event;

			// Ignore modifiers (except Ctrl/Meta for backspace) and special keys
			// We allow Ctrl/Meta + Backspace
			const isBackspace = key === 'Backspace';
			const isModifier = ctrlKey || altKey || metaKey;

			if (isModifier && !(isBackspace && (ctrlKey || metaKey))) {
				return;
			}

			if (key.length > 1 && !isBackspace) {
				return;
			}

			// Prevent default behavior for some keys
			if (key === ' ' || (isBackspace && (ctrlKey || metaKey))) {
				event.preventDefault(); // Prevent scrolling or browser back
			}

			if (!startTime) {
				setStartTime(Date.now());
			}

			setTyped((prev) => {
				const lockedIndex = getLockedIndex(prev);

				if (isBackspace) {
					if (prev.length <= lockedIndex) return prev;

					if (ctrlKey || metaKey) {
						// Ctrl + Backspace: Delete to beginning of current word
						// 1. Find the last space before the cursor (excluding the one right at cursor if any)
						// Actually, standard Ctrl+BSP behavior:
						// - If inside a word, delete to start of word.
						// - If at start of word (after space), delete the space and the previous word?
						// Let's implement "Delete until previous whitespace or locked index"

						let newIndex = prev.length;

						// Skip trailing spaces if any (though usually just one)
						while (newIndex > lockedIndex && prev[newIndex - 1] === ' ') {
							newIndex--;
						}

						// Skip non-spaces
						while (newIndex > lockedIndex && prev[newIndex - 1] !== ' ') {
							newIndex--;
						}

						return prev.slice(0, newIndex);
					}

					return prev.slice(0, -1);
				}

				if (key === ' ' && prev.endsWith(' ')) {
					return prev;
				}

				// Typing a character
				// if (prev.length >= targetText.length) return prev;
				return prev + key;
			});
		},
		[enabled, startTime, getLockedIndex],
	);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [handleKeyDown]);

	const reset = useCallback(() => {
		setTyped('');
		setStartTime(null);
	}, []);

	return {
		typed,
		reset,
		cursorPosition: typed.length,
	};
}
