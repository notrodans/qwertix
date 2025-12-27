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
	if (state === 'loading' && loadingFallback) {
		return <>{loadingFallback}</>;
	}

	if (state === 'error' && errorFallback) {
		return <>{errorFallback}</>;
	}

	return (
		<div
			className="flex flex-col gap-8 w-full max-w-3xl"
			data-testid="typing-board"
		>
			{/* Top: Config Summary */}
			<div data-testid="config-summary" className="flex justify-center">
				{config}
			</div>

			{/* Middle: Typing Text Area */}
			<div className="relative min-h-37.5">{board}</div>

			{/* Bottom: Restart Button */}
			<div className="flex justify-center mt-8">{controls}</div>
		</div>
	);
}
