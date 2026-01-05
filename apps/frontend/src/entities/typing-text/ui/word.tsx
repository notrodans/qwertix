import { memo, type ReactNode } from 'react';

interface WordProps {
	children: ReactNode;
	index: number;
	state: string;
	hasError: boolean;
}

export const Word = memo(function Word({
	children,
	index,
	state,
	hasError,
}: WordProps) {
	return (
		<span
			key={index}
			data-testid="word"
			data-state={state}
			data-has-error={hasError}
			className={`inline-block mr-0 border-b-2 ${
				hasError ? 'border-[#ca4754]' : 'border-transparent'
			}`}
		>
			{children}
		</span>
	);
});
