import { type ComponentProps, type RefObject, useMemo, useRef } from 'react';
import { useTextScroll } from '../model/use-text-scroll';
import { Caret } from './caret';
import { Character } from './character';
import { SmartWord } from './smart-word';

interface TextDisplayProps extends ComponentProps<'div'> {
	targetText: string;
	userTyped: string;
	caretPos: { left: number; top: number };
	containerRef: RefObject<HTMLDivElement | null>;
}

export function TextDisplay({
	targetText,
	userTyped,
	caretPos,
	containerRef,
	className,
	...props
}: TextDisplayProps) {
	const targetWords = useMemo(() => targetText.split(' '), [targetText]);
	const userWords = userTyped.split(' ');
	const scrollOffset = useTextScroll(containerRef, userTyped);
	const wrapperRef = useRef<HTMLDivElement>(null);

	let globalIndex = 0;

	return (
		<div
			ref={wrapperRef}
			className="relative overflow-hidden select-none"
			style={{ height: '9rem' }} // Exactly 3 lines (3 * 3rem)
		>
			<div
				ref={containerRef}
				className={`flex flex-wrap font-mono text-3xl leading-relaxed relative transition-transform duration-200 ${className}`}
				style={{ transform: `translateY(-${scrollOffset}px)` }}
				data-testid="text-display"
				{...props}
			>
				<Caret left={caretPos.left} top={caretPos.top} />
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

					const wordStartIndex = globalIndex;
					const maxLength = Math.max(targetWord.length, userWord.length);
					globalIndex += maxLength;

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
								className="text-muted-foreground/50"
								type="space"
								status={isSpaceTyped ? 'typed' : 'untyped'}
								width="0.5ch"
							/>
						);
					}

					return (
						<div key={wordIndex} className="flex whitespace-nowrap">
							<SmartWord
								targetWord={targetWord}
								userWord={userWord}
								wordIndex={wordIndex}
								globalStartIndex={wordStartIndex}
								state={wordState}
								hasError={hasError}
							/>
							{spaceEl}
						</div>
					);
				})}
			</div>
		</div>
	);
}
