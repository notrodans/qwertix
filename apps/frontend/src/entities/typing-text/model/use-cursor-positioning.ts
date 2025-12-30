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
			} else {
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
				} else if (cursorIndex === 0) {
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
			}
		},
		[containerRef, setCaretPos],
	);
}
