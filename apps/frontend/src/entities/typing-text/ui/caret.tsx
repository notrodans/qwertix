interface CaretProps {
	left: number;
	top: number;
}

export function Caret({ left, top }: CaretProps) {
	return (
		<div
			className="absolute w-0.5 h-[1.5em] bg-[#e2b714]"
			data-testid="cursor"
			style={{
				left,
				top,
				transition:
					'left 0.2s cubic-bezier(0.4, 1, 0.5, 1), top 0.2s cubic-bezier(0.4, 1, 0.5, 1)',
			}}
		/>
	);
}
