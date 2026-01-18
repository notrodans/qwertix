import { memo } from 'react';
import { Character } from './character';
import { Word } from './word';

interface SmartWordProps {
	targetWord: string;
	userWord: string;
	wordIndex: number;
	globalStartIndex: number;
	state: string;
	hasError: boolean;
}

export const SmartWord = memo(function SmartWord({
	targetWord,
	userWord,
	wordIndex,
	globalStartIndex,
	state,
	hasError,
}: SmartWordProps) {
	const maxLength = Math.max(targetWord.length, userWord.length);
	const chars = [];

	for (let i = 0; i < maxLength; i++) {
		const charIndex = globalStartIndex + i;
		const targetChar = targetWord[i];
		const userChar = userWord[i];

		let charToRender = targetChar;
		let className = 'text-muted-foreground'; // Default untyped
		let charType = 'target';
		let charStatus = 'untyped';

		if (i < userWord.length) {
			// User typed something here
			if (i < targetWord.length) {
				// Within bounds: Show TARGET char
				charToRender = targetChar;
				if (userChar === targetChar) {
					className = 'text-foreground';
					charStatus = 'correct';
				} else {
					className = 'text-destructive';
					charStatus = 'incorrect';
				}
			} else {
				// Extra character: Show USER char
				charToRender = userChar;
				className = 'text-destructive/60';
				charType = 'extra';
				charStatus = 'extra';
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
				className={className}
				type={charType}
				status={charStatus}
			/>,
		);
	}

	return (
		<Word index={wordIndex} state={state} hasError={hasError}>
			{chars}
		</Word>
	);
});
