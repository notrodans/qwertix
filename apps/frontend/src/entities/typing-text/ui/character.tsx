import { memo } from 'react';
import { cn } from '@/shared/lib/utils';

interface CharacterProps {
	char: string;
	className?: string;
	index: number;
	type?: string;
	status?: string;
	width?: string;
}

export const Character = memo(function Character({
	char,
	className,
	index,
	type = 'target',
	status = 'untyped',
	width,
}: CharacterProps) {
	return (
		<span
			data-index={index}
			data-testid="char"
			data-type={type}
			data-status={status}
			data-char-value={char}
			className={cn('inline-block', className)}
			style={{ width }}
		>
			{char === ' ' ? '\u00A0' : char}
		</span>
	);
});
