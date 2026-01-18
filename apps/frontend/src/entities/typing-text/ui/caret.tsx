interface CaretProps {
	left: number;
	top: number;
}

export function Caret({ left, top }: CaretProps) {
	return (
		<div
			className="absolute w-[2.5px] h-[1.5em] bg-primary rounded-4xl"
			data-testid="cursor"
			style={{
				left,
				top,
				transition:
					'left 0.1s cubic-bezier(1, 1, 1, 1), top 0.1s cubic-bezier(1, 1, 1, 1)',
			}}
		/>
	);
}
