import { type RefObject, useCallback } from 'react';

export function useCursorPositioning(
	containerRef: RefObject<HTMLElement | null>,
	setCaretPos: (pos: { left: number; top: number }) => void,
) {
	return useCallback(
		(cursorIndex: number) => {
			if (!containerRef.current) return;

			const activeEl = containerRef.current.querySelector(
				`[data-index="${cursorIndex}"]`,
			) as HTMLElement;

			if (activeEl) {
				setCaretPos({ left: activeEl.offsetLeft, top: activeEl.offsetTop });
				return;
			}

			// Fallback: if we are at the very end or off-screen
			const prevIndex = cursorIndex - 1;
			const prevEl = containerRef.current.querySelector(
				`[data-index="${prevIndex}"]`,
			) as HTMLElement;

			if (prevEl) {
				setCaretPos({
					left: prevEl.offsetLeft + prevEl.offsetWidth,
					top: prevEl.offsetTop,
				});
				return;
			}

			// Fallback 2: if index is far ahead (e.g. extra invisible words), snap to last element
			const allChars = containerRef.current.querySelectorAll(
				'[data-testid="char"]',
			);
			const lastChar = allChars[allChars.length - 1] as HTMLElement;
			if (lastChar) {
				setCaretPos({
					left: lastChar.offsetLeft + lastChar.offsetWidth,
					top: lastChar.offsetTop,
				});
				return;
			}

			if (cursorIndex === 0) {
				// Start of test, if element 0 exists
				const firstEl = containerRef.current.querySelector(
					'[data-index="0"]',
				) as HTMLElement;

				if (firstEl) {
					setCaretPos({
						left: firstEl.offsetLeft,
						top: firstEl.offsetTop,
					});
				}
			}
		},
		[containerRef, setCaretPos],
	);
}
