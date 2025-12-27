import { useCallback, useEffect, useMemo, useRef } from 'react';

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
	const cursorRef = useRef<HTMLDivElement>(null);

	// Mapping logic to find the visual index for each typed character
	const visualMapping = useMemo(() => {
		const mapping: number[] = [];
		let gCharIdx = 0;

		words.forEach((targetWord, wordIndex) => {
			const typedWord = typedWords[wordIndex] || '';
			const isLastWord = wordIndex === words.length - 1;
			const maxLength = Math.max(targetWord.length, typedWord.length);

			for (let i = 0; i < maxLength; i++) {
				if (i < typedWord.length) {
					mapping.push(gCharIdx);
				}
				gCharIdx++;
			}

			if (!isLastWord) {
				if (wordIndex < typedWords.length - 1) {
					mapping.push(gCharIdx);
				}
				gCharIdx++;
			}
		});
		return mapping;
	}, [words, typedWords]);

	const updateCursor = useCallback(() => {
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

		const lastTypedVisualIndex =
			currentIndex > 0 ? visualMapping[currentIndex - 1] : -1;

		const prevSpan =
			lastTypedVisualIndex !== undefined && lastTypedVisualIndex !== -1
				? charRefs.current[lastTypedVisualIndex]
				: null;

		const nextVisualIndex =
			lastTypedVisualIndex !== -1 ? lastTypedVisualIndex + 1 : 0;
		const currentSpan = charRefs.current[nextVisualIndex];

		if (prevSpan && currentSpan) {
			const isCurrentSpace = currentSpan.dataset.type === 'space';
			const onSameLine =
				Math.abs(currentSpan.offsetTop - prevSpan.offsetTop) < 10;

			if (onSameLine || isCurrentSpace) {
				left = prevSpan.offsetLeft + prevSpan.offsetWidth;
				top = prevSpan.offsetTop;
				height = prevSpan.offsetHeight;
			} else {
				left = currentSpan.offsetLeft;
				top = currentSpan.offsetTop;
				height = currentSpan.offsetHeight;
			}
		} else if (currentSpan) {
			left = currentSpan.offsetLeft;
			top = currentSpan.offsetTop;
			height = currentSpan.offsetHeight;
		} else if (prevSpan) {
			left = prevSpan.offsetLeft + prevSpan.offsetWidth;
			top = prevSpan.offsetTop;
			height = prevSpan.offsetHeight;
		}

		const adjustedTop = top + height * 0.15;
		const adjustedHeight = height * 0.7;

		cursorEl.style.transform = `translate3d(${left}px, ${adjustedTop}px, 0)`;
		cursorEl.style.height = `${adjustedHeight}px`;
		cursorEl.style.opacity = '1';
	}, [typed, text, visualMapping]);

	// Effect for resize only
	useEffect(() => {
		window.addEventListener('resize', updateCursor);
		return () => {
			window.removeEventListener('resize', updateCursor);
		};
	}, [updateCursor]);

	// Callback ref for the cursor element. Placed at the end of JSX to ensure 
	// it runs after child span refs are populated. This satisfies the requirement
	// to avoid useLayoutEffect while keeping animations stable.
	const cursorRefCallback = useCallback((el: HTMLDivElement | null) => {
		cursorRef.current = el;
		if (el) {
			updateCursor();
		}
	}, [updateCursor]);

	let globalCharIndex = 0;

	return (
		<div className="text-2xl leading-relaxed font-mono relative flex flex-wrap gap-y-2 select-none">
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
									data-testid="char-span"
									className={`${colorClass}`}
								>
									{textToRender}
								</span>
							);
						})}
						{!isLastWord && (
							<span
								ref={(el) => {
									const currentIndex = globalCharIndex++;
									charRefs.current[currentIndex] = el;
								}}
								data-testid="char-span"
								data-type="space"
								className="whitespace-pre w-[0.5ch] inline-block"
							>
								{' '}
							</span>
						)}
					</div>
				);
			})}

			<div
				ref={cursorRefCallback}
				data-testid="cursor"
				className="absolute left-0 top-0 w-0.5 bg-[#e2b714] will-change-transform z-10 transition-[transform,height,opacity] duration-100 ease-out opacity-0"
			/>
		</div>
	);
}
