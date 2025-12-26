import { useLayoutEffect, useMemo, useRef } from 'react';

interface TextDisplayProps {
	text: string;
	typed: string;
}

export function TextDisplay({ text, typed }: TextDisplayProps) {
	const words = useMemo(() => {
		if (!text) return [];
		return text.split(' ');
	}, [text]);

	const typedWords = useMemo(() => {
		return typed.split(' ');
	}, [typed]);

	const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);
	const cursorRef = useRef<HTMLDivElement>(null);

	charRefs.current = [];
	let globalCharIndex = 0;

	useLayoutEffect(() => {
		const currentIndex = typed.length;
		const cursorEl = cursorRef.current;

		if (!cursorEl) return;

		if (!text) {
			cursorEl.style.opacity = '0';
			return;
		}

		let left = 0;
		let top = 0;
		let height = 0;

		const currentSpan = charRefs.current[currentIndex];
		const prevSpan = charRefs.current[currentIndex - 1];

		if (prevSpan && currentSpan) {
			const isCurrentSpace = currentSpan.dataset.type === 'space';
			// Check if they are on the same line
			const onSameLine =
				Math.abs(currentSpan.offsetTop - prevSpan.offsetTop) < 10;

			if (onSameLine || isCurrentSpace) {
				// Stick to the end of the previous character (stable for spaces)
				left = prevSpan.offsetLeft + prevSpan.offsetWidth;
				top = prevSpan.offsetTop;
				height = prevSpan.offsetHeight;
			} else {
				// Wrapped to new line, align to start of current
				left = currentSpan.offsetLeft;
				top = currentSpan.offsetTop;
				height = currentSpan.offsetHeight;
			}
		} else if (currentSpan) {
			// Start of text
			left = currentSpan.offsetLeft;
			top = currentSpan.offsetTop;
			height = currentSpan.offsetHeight;
		} else if (prevSpan) {
			// End of text
			left = prevSpan.offsetLeft + prevSpan.offsetWidth;
			top = prevSpan.offsetTop;
			height = prevSpan.offsetHeight;
		}

		const adjustedTop = top + height * 0.15;
		const adjustedHeight = height * 0.7;

		cursorEl.style.transform = `translate3d(${left}px, ${adjustedTop}px, 0)`;
		cursorEl.style.height = `${adjustedHeight}px`;
		cursorEl.style.opacity = '1';
	}, [typed, text]);

	return (
		<div
			ref={containerRef}
			className="text-2xl leading-relaxed font-mono relative flex flex-wrap gap-y-2 select-none"
		>
			<div
				ref={cursorRef}
				className="absolute left-0 top-0 w-0.5 bg-[#e2b714] will-change-transform z-10"
				style={{
					opacity: 0,
					transition: 'transform 0.1s ease-out, height 0.1s ease-out',
				}}
			/>

			{words.map((targetWord, wordIndex) => {
				const typedWord = typedWords[wordIndex] || '';
				const isLastWord = wordIndex === words.length - 1;

				const maxLength = Math.max(targetWord.length, typedWord.length);
				const charIndices = Array.from({ length: maxLength }, (_, i) => i);

				return (
					<div
						key={wordIndex}
						className="flex whitespace-nowrap border-b-2 border-transparent"
					>
						{charIndices.map((charIndex) => {
							const char = targetWord[charIndex];
							const typedChar = typedWord[charIndex];
							const currentIndex = globalCharIndex++;
							const isExtra = charIndex >= targetWord.length;
							let colorClass = 'text-[#646669]';
							let textToRender = char;

							if (isExtra) {
								textToRender = typedChar;
								colorClass = 'text-[#7d2a2f]';
							} else if (typedChar !== undefined) {
								const isCorrect = typedChar === char;
								colorClass = isCorrect ? 'text-[#d1d0c5]' : 'text-[#ca4754]';
							}

							return (
								<span
									key={charIndex}
									ref={(el) => {
										charRefs.current[currentIndex] = el;
									}}
									className={`${colorClass}`}
								>
									{textToRender}
								</span>
							);
						})}
						{!isLastWord && (
							<span
								ref={(el) => {
									charRefs.current[globalCharIndex++] = el;
								}}
								data-type="space"
								className="whitespace-pre w-[0.5ch] inline-block"
							>
								{' '}
							</span>
						)}
					</div>
				);
			})}
		</div>
	);
}
