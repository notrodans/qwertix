interface CharacterProps {
	char: string;
	color: string;
	index: number;
	type?: string;
	status?: string;
	width?: string;
}

export function Character({
	char,
	color,
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
			className="inline-block"
			style={{ color, width }}
		>
			{char === ' ' ? '\u00A0' : char}
		</span>
	);
}
