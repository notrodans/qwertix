interface TypingStatusIndicatorProps {
	state: 'loading' | 'error';
	message?: string;
}

export function TypingStatusIndicator({
	state,
	message,
}: TypingStatusIndicatorProps) {
	if (state === 'loading') {
		return (
			<div
				data-testid="loading-state"
				className="flex justify-center items-center h-50 text-muted-foreground"
			>
				{message || 'Loading...'}
			</div>
		);
	}

	return (
		<div
			data-testid="error-state"
			className="flex justify-center items-center h-50 text-destructive"
		>
			{message || 'Failed to load words.'}
		</div>
	);
}
