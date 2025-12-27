import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { TextDisplay, useGetWords } from '@/entities/typing-text';
import { useTyping } from '@/features/typing/pub';
import { RefreshIcon } from '@/shared/ui/icon/refresh-icon';

export function TypingBoard() {
	const { data: text, isLoading, isError } = useGetWords();
	const queryClient = useQueryClient();

	// We need to sync the hook's text with the query data
	const targetText = text || '';
	const { typed, reset: resetTyping } = useTyping({
		targetText,
		enabled: !isLoading,
	});

	const handleReset = () => {
		resetTyping();
		queryClient.invalidateQueries({ queryKey: ['words'] });
	};

	// Reset typing when text changes (e.g. initial load or refetch)
	useEffect(() => {
		if (targetText) {
			resetTyping();
		}
	}, [targetText, resetTyping]);

	if (isLoading) {
		return <div className="text-[#646669] animate-pulse">Loading words...</div>;
	}

	if (isError) {
		return <div className="text-[#ca4754]">Error loading words.</div>;
	}

	return (
		<div className="flex flex-col gap-8 w-full max-w-250">
			{/* Header / Config Bar */}
			<div className="flex justify-center items-center gap-4 text-[#646669] text-sm">
				<div className="flex items-center gap-2 cursor-pointer hover:text-[#d1d0c5] transition-colors">
					<span>🌍</span>
					<span>english</span>
				</div>
			</div>
			{/* Main Text Display */}
			<div
				className="relative min-h-37.5 w-full select-none"
				onClick={() => document.body.focus()}
			>
				<TextDisplay text={targetText} typed={typed} />
			</div>
			{/* Controls / Restart */}
			<div className="flex justify-center mt-8">
				<button
					type="button"
					onClick={handleReset}
					className="text-[#646669] hover:text-[#d1d0c5] transition-colors p-4 focus:outline-none focus:ring-0 bg-transparent border-none cursor-pointer"
					aria-label="Restart Test"
				>
					<RefreshIcon className="w-6 h-6" />
				</button>
			</div>
		</div>
	);
}
