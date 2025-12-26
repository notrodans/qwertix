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

		const nextCharSpan = charRefs.current[currentIndex];
		const prevCharSpan = charRefs.current[currentIndex - 1];

		if (nextCharSpan?.dataset.type === 'space') {
			// The next character is a space that hasn't been typed yet.
			// Position the cursor at the END of the previous character.
			if (prevCharSpan) {
				left = prevCharSpan.offsetLeft + prevCharSpan.offsetWidth;
				top = prevCharSpan.offsetTop;
				height = prevCharSpan.offsetHeight;
			}
		} else if (nextCharSpan) {
			// Default behavior: position at the START of the next character.
			left = nextCharSpan.offsetLeft;
			top = nextCharSpan.offsetTop;
			height = nextCharSpan.offsetHeight;
		} else if (prevCharSpan) {
			// We are at the end of all rendered text, position after the last char.
			left = prevCharSpan.offsetLeft + prevCharSpan.offsetWidth;
			top = prevCharSpan.offsetTop;
			height = prevCharSpan.offsetHeight;
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
				className="absolute left-0 top-0 w-[2px] bg-[#e2b714] will-change-transform z-10"
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
