import type { ReactNode } from 'react';

interface TypingSessionLayoutProps {
	config: ReactNode;
	board: ReactNode;
	controls: ReactNode;
	state?: 'loading' | 'error' | 'ready';
	loadingFallback?: ReactNode;
	errorFallback?: ReactNode;
}

export function TypingSessionLayout({
	config,
	board,
	controls,
	state = 'ready',
	loadingFallback,
	errorFallback,
}: TypingSessionLayoutProps) {
	return (
		<div
			className="flex flex-col gap-8 w-full max-w-3xl items-center"
			data-testid="typing-board"
		>
			{/* Top: Config Summary */}
			<div data-testid="config-summary" className="flex justify-center min-h-8">
				{config}
			</div>

			{/* Middle: Typing Text Area */}
			<div className="relative min-h-[9rem] w-full">
				{state === 'loading' && loadingFallback ? (
					<div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 backdrop-blur-sm">
						{loadingFallback}
					</div>
				) : state === 'error' && errorFallback ? (
					<div className="absolute inset-0 flex items-center justify-center">
						{errorFallback}
					</div>
				) : (
					board
				)}
			</div>

			{/* Bottom: Restart Button */}
			<div className="flex justify-center mt-8 min-h-[3.5rem]">{controls}</div>
		</div>
	);
}
