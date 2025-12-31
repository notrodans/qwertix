import { type ReactNode } from 'react';
import {
	RestartButton,
	TextDisplay,
	TypingSessionLayout,
	TypingStatusIndicator,
} from '@/entities/typing-text';
import { useSoloGame } from '../model/use-solo-game';
import { SoloIndicators } from '../ui/solo-indicators';
import { SoloToolbar } from '../ui/solo-toolbar';

export interface SoloResult {
	wpm: number;
	raw: number;
	accuracy: number;
	consistency: number;
	replayData: { key: string; timestamp: number }[];
	fullText: string;
}

interface SoloTypingMediatorProps {
	renderResults?: (results: SoloResult, onRestart: () => void) => ReactNode;
}

export function SoloTypingMediator({ renderResults }: SoloTypingMediatorProps) {
	const {
		status,
		mode,
		wordCount,
		timeLeft,
		results,
		isSaving,
		text,
		userTyped,
		caretPos,
		containerRef,
		restart,
	} = useSoloGame();

	if (status === 'RESULT') {
		if (isSaving) {
			return (
				<div className="flex flex-col items-center justify-center h-64 gap-4">
					<TypingStatusIndicator state="loading" />
					<div className="text-zinc-400 font-medium">
						Calculating results...
					</div>
				</div>
			);
		}

		if (results) {
			return renderResults ? (
				renderResults(results, restart)
			) : (
				<div>Run complete!</div>
			);
		}
	}

	const typedWordsCount = userTyped.split(' ').length - 1;

	return (
		<div className="flex flex-col items-center gap-12 w-full">
			<SoloToolbar />

			<TypingSessionLayout
				state={text ? 'ready' : 'loading'}
				loadingFallback={<TypingStatusIndicator state="loading" />}
				errorFallback={<TypingStatusIndicator state="error" />}
				config={
					<SoloIndicators
						mode={mode}
						timeLeft={timeLeft}
						wordCount={wordCount}
						typedWordsCount={typedWordsCount}
					/>
				}
				board={
					<TextDisplay
						targetText={text}
						userTyped={userTyped}
						caretPos={caretPos}
						containerRef={containerRef}
						className=""
					/>
				}
				controls={<RestartButton onReset={restart} />}
			/>
		</div>
	);
}
