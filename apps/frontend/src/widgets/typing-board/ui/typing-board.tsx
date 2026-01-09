import { reatomComponent } from '@reatom/react';
import { useEffect, useRef } from 'react';
import {
	caretPosAtom,
	cursorIndexAtom,
	fetchWords,
	RestartButton,
	resetTyping,
	setCaretPos,
	TextDisplay,
	TypingConfigSummary,
	TypingSessionLayout,
	TypingStatusIndicator,
	targetTextAtom,
	typingListenerAtom,
	useCursorPositioning,
	userTypedAtom,
} from '@/entities/typing-text';

export const TypingBoard = reatomComponent(() => {
	const words = fetchWords.data();
	const isLoading = fetchWords.pending() > 0 && words.length === 0;
	const isError = !!fetchWords.error();
	const refetch = fetchWords;

	const containerRef = useRef<HTMLDivElement>(null);

	const text = words ? words.join(' ') : '';

	// Sync text to model
	useEffect(() => {
		if (text) targetTextAtom.set(text);
	}, [text]);

	const userTyped = userTypedAtom();
	const caretPos = caretPosAtom();
	const cursorIndex = cursorIndexAtom();

	// Keydown
	typingListenerAtom();

	// Cursor
	const updateCursor = useCursorPositioning(containerRef, setCaretPos);
	useEffect(() => {
		requestAnimationFrame(() => updateCursor(cursorIndex));
	}, [cursorIndex, updateCursor]);

	const handleReset = () => {
		refetch();
		resetTyping();
	};

	return (
		<TypingSessionLayout
			state={isLoading ? 'loading' : isError ? 'error' : 'ready'}
			loadingFallback={<TypingStatusIndicator state="loading" />}
			errorFallback={<TypingStatusIndicator state="error" />}
			config={<TypingConfigSummary />}
			board={
				<TextDisplay
					targetText={text}
					userTyped={userTyped}
					caretPos={caretPos}
					containerRef={containerRef}
					className="wrap-break-word text-justify"
				/>
			}
			controls={<RestartButton onReset={handleReset} />}
		/>
	);
});
