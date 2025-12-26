import { useLayoutEffect, useMemo, useRef } from 'react';

interface TextDisplayProps {
	text: string;
	typed: string;
}

export function TextDisplay({ text, typed }: TextDisplayProps) {
	// Split text into words
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

	// Reset refs on every render to ensure mapping is correct
	charRefs.current = [];
	let globalCharIndex = 0;

	// Update cursor position
	useLayoutEffect(() => {
		const currentIndex = typed.length;
		const cursorEl = cursorRef.current;
		const container = containerRef.current;

		if (!cursorEl || !container) return;

		// Hide cursor if text is empty
		if (!text) {
			cursorEl.style.opacity = '0';
			return;
		}

		let target: HTMLElement | null = null;
		let left = 0;
		let top = 0;
		let height = 0;

		// We try to find the character at the current index
		// Because we populate charRefs including extra characters, the index should align 1:1 with typed.length
		target = charRefs.current[currentIndex];

		if (target) {
			left = target.offsetLeft;
			top = target.offsetTop;
			height = target.offsetHeight;
		} else {
			// Fallback: Cursor is past the end of the rendered text
			// Snap to the right side of the last rendered character
			const lastValidIndex = charRefs.current.length - 1;
			const lastChar = charRefs.current[lastValidIndex];

			if (lastChar) {
				left = lastChar.offsetLeft + lastChar.offsetWidth;
				top = lastChar.offsetTop;
				height = lastChar.offsetHeight;
			}
		}

		// Adjust vertical alignment
		const adjustedTop = top + height * 0.15;
		const adjustedHeight = height * 0.7;

		// Apply styles directly
		cursorEl.style.transform = `translate3d(${left}px, ${adjustedTop}px, 0)`;
		cursorEl.style.height = `${adjustedHeight}px`;
		cursorEl.style.opacity = '1';
	}, [typed, text]); // words and typedWords are derived from these

	return (
		<div
			ref={containerRef}
			className="text-2xl leading-relaxed font-mono relative flex flex-wrap gap-y-2 select-none"
		>
			{/* Smooth Cursor */}
			<div
				ref={cursorRef}
				className="absolute left-0 top-0 w-[2px] bg-[#e2b714] will-change-transform z-10"
				style={{
					opacity: 0,
					transition: 'transform 0.15s ease-out, height 0.15s ease-out',
				}}
			/>
			{words.map((targetWord, wordIndex) => {
				const typedWord = typedWords[wordIndex] || '';
				const isLastWord = wordIndex === words.length - 1;

				// Iterate over the longer of the two (target vs typed) to show extras
				const maxLength = Math.max(targetWord.length, typedWord.length);
				const charIndices = Array.from({ length: maxLength }, (_, i) => i);

				// Determine if there is an error in this word
				// Used for potential word-level styling if needed, currently unused but good for debug
				// const hasError = typedWord !== targetWord.slice(0, typedWord.length);

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

							let colorClass = 'text-[#646669]'; // Untyped grey
							let textToRender = char;

							if (isExtra) {
								textToRender = typedChar;
								colorClass = 'text-[#7d2a2f]'; // Dark red for extra chars
							} else {
								// Normal character logic
								if (typedChar !== undefined) {
									const isCorrect = typedChar === char;
									colorClass = isCorrect ? 'text-[#d1d0c5]' : 'text-[#ca4754]';
								}
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
						{/* Space Character */}
						{!isLastWord && (
							<span
								ref={(el) => {
									charRefs.current[globalCharIndex++] = el;
								}}
								className="whitespace-pre w-[0.5ch] inline-block"
							></span>
						)}
					</div>
				);
			})}
		</div>
	);
}
