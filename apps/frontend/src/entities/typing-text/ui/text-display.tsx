import { type ComponentProps, useEffect, useRef, useState } from 'react';
import { Caret } from './caret';
import { Character } from './character';
import { Word } from './word';

interface TextDisplayProps extends ComponentProps<'div'> {
	targetText: string;
	userTyped: string;
}

export function TextDisplay({
	targetText,
	userTyped,
	className,
	...props
}: TextDisplayProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [cursorPos, setCursorPos] = useState({ left: 0, top: 0 });

	useEffect(() => {
		if (!containerRef.current) return;

		const activeIndex = userTyped.length;
		const activeEl = containerRef.current.querySelector(
			`[data-index="${activeIndex}"]`,
		) as HTMLElement;

		if (activeEl) {
			setCursorPos({
				left: activeEl.offsetLeft,
				top: activeEl.offsetTop,
			});
		} else {
			// Fallback: if we are at the very end, try to find the last element and append
			// Or maybe we just typed the last character?
			// With dynamic indices, the last element should have index = userTyped.length - 1.
			// The "next" position is after it.
			const lastIndex = userTyped.length - 1;
			const lastEl = containerRef.current.querySelector(
				`[data-index="${lastIndex}"]`,
			) as HTMLElement;

			if (lastEl) {
				setCursorPos({
					left: lastEl.offsetLeft + lastEl.offsetWidth,
					top: lastEl.offsetTop,
				});
			} else if (userTyped.length === 0 && targetText.length > 0) {
				// Start of test
				const firstEl = containerRef.current.querySelector(
					'[data-index="0"]',
				) as HTMLElement;
				if (firstEl) {
					setCursorPos({ left: firstEl.offsetLeft, top: firstEl.offsetTop });
				}
			}
		}
	}, [userTyped, targetText]);

	let globalIndex = 0;
	const targetWords = targetText.split(' ');
	const userWords = userTyped.split(' ');

	return (
		<div
			ref={containerRef}
			className={`font-mono text-2xl leading-relaxed wrap-break-word relative ${className}`}
			data-testid="text-display"
			{...props}
		>
			<Caret left={cursorPos.left} top={cursorPos.top} />
			{targetWords.map((targetWord, wordIndex) => {
				const userWord = userWords[wordIndex] || '';

				// Determine state
				const isPast = userWords.length > wordIndex + 1;
				const isActive = userWords.length === wordIndex + 1;

				let wordState = 'upcoming';
				if (isPast) wordState = 'past';
				else if (isActive) wordState = 'active';

				const isCorrectWord = userWord === targetWord;
				const hasExtras = userWord.length > targetWord.length;

				const hasError = (isPast && !isCorrectWord) || hasExtras;

				// We render max length to accommodate extras
				const maxLength = Math.max(targetWord.length, userWord.length);

				const chars = [];
				for (let i = 0; i < maxLength; i++) {
					const charIndex = globalIndex++; // Assign unique index to every rendered char

					const targetChar = targetWord[i]; // Might be undefined if extra
					const userChar = userWord[i]; // Might be undefined if untyped

					let charToRender = targetChar;
					let color = '#646669'; // Default untyped

					let charType = 'target';
					let charStatus = 'untyped';

					if (i < userWord.length) {
						// User typed something here

						if (i < targetWord.length) {
							// Within bounds: Show TARGET char
							charToRender = targetChar;
							if (userChar === targetChar) {
								color = '#d1d0c5';
								charStatus = 'correct';
							} else {
								color = '#ca4754';
								charStatus = 'incorrect';
							}
						} else {
							// Extra character: Show USER char
							charToRender = userChar;
							color = '#7e2a33';
							charType = 'extra';
							charStatus = 'extra'; // Or incorrect?
						}
					} else {
						// Untyped part of target
						charToRender = targetChar;
					}

					chars.push(
						<Character
							key={charIndex}
							index={charIndex}
							char={charToRender ?? ''}
							color={color}
							type={charType}
							status={charStatus}
						/>,
					);
				}

				// Logic for space
				const showSpace = wordIndex < targetWords.length - 1;
				let spaceEl = null;

				if (showSpace) {
					const spaceIndex = globalIndex++;
					const isSpaceTyped = userWords.length > wordIndex + 1;

					spaceEl = (
						<Character
							key={spaceIndex}
							index={spaceIndex}
							char=" "
							color="#646669"
							type="space"
							status={isSpaceTyped ? 'typed' : 'untyped'}
							width="0.5ch"
						/>
					);
				}

				return (
					<Word
						key={wordIndex}
						index={wordIndex}
						state={wordState}
						hasError={hasError}
					>
						{chars}
						{spaceEl}
					</Word>
				);
			})}
		</div>
	);
}
