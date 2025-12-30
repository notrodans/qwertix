import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import {
	RestartButton,
	TextDisplay,
	TypingConfigSummary,
	TypingSessionLayout,
	TypingStatusIndicator,
	useTyping,
	wordQueries,
} from '@/entities/typing-text';

export function TypingBoard() {
	const {
		data: words,
		isLoading,
		isError,
		refetch,
	} = useQuery(wordQueries.list());

	const containerRef = useRef<HTMLDivElement>(null);

	const text = words ? words.join(' ') : '';
	const { userTyped, caretPos, reset } = useTyping(text, containerRef);

	const handleReset = () => {
		refetch();
		reset();
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
}
