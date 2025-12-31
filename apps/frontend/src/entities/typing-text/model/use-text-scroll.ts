import { type RefObject, useLayoutEffect, useState } from 'react';

export function useTextScroll(
	containerRef: RefObject<HTMLElement | null>,
	trigger: unknown,
) {
	const [scrollOffset, setScrollOffset] = useState(0);

	useLayoutEffect(() => {
		if (!containerRef.current) return;

		const activeWord = containerRef.current.querySelector(
			'[data-state="active"]',
		) as HTMLElement;
		if (!activeWord) return;

		const wordTop = activeWord.offsetTop;
		const rowHeight = activeWord.offsetHeight;

		// We want the active word to be on the second row
		// If wordTop > rowHeight, we need to scroll.
		// Formula: offset = wordTop - rowHeight (so active is at row 1, index 0 is row 0)
		if (wordTop > rowHeight) {
			setScrollOffset(wordTop - rowHeight);
		} else {
			setScrollOffset(0);
		}
	}, [trigger, containerRef]);

	return scrollOffset;
}
