import { useQuery } from '@tanstack/react-query';
import { TextDisplay, wordQueries } from '@/entities/typing-text';
import {
	RestartButton,
	TypingConfigSummary,
	TypingSessionLayout,
	TypingStatusIndicator,
	useTyping,
} from '@/features/typing/pub';

export function TypingBoard() {
	const {
		data: words,
		isLoading,
		isError,
		refetch,
	} = useQuery(wordQueries.list());

	const text = words ? words.join(' ') : '';
	const { userTyped, reset } = useTyping(text);

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
					className="wrap-break-word text-justify"
				/>
			}
			controls={<RestartButton onReset={handleReset} />}
		/>
	);
}
