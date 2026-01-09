import { reatomComponent } from '@reatom/react';
import { type ReactNode, useEffect, useRef } from 'react';
import {
	cursorIndexAtom,
	RestartButton,
	setCaretPos,
	TextDisplay,
	TypingSessionLayout,
	TypingStatusIndicator,
	typingListenerAtom,
	useCursorPositioning,
} from '@/entities/typing-text';
import { SoloStatusEnum } from '../model/store';
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
	afkDuration: number;
}

interface SoloTypingMediatorProps {
	renderResults?: (results: SoloResult, onRestart: () => void) => ReactNode;
}

export const SoloTypingMediator = reatomComponent(
	({ renderResults }: SoloTypingMediatorProps) => {
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
			restart,
			initialize,
			stop,
			resumeFromIdle,
		} = useSoloGame();

		useEffect(() => {
			initialize();
			return () => stop();
		}, [initialize, stop]);

		const containerRef = useRef<HTMLDivElement>(null);
		const cursorIndex = cursorIndexAtom();

		// Keydown listener
		typingListenerAtom();

		// Cursor positioning
		const updateCursor = useCursorPositioning(containerRef, setCaretPos);

		useEffect(() => {
			requestAnimationFrame(() => updateCursor(cursorIndex));
		}, [cursorIndex, updateCursor]);

		if (status === SoloStatusEnum.RESULT) {
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
		const isConfigVisible = status !== SoloStatusEnum.TYPING;

		return (
			<div className="flex flex-col items-center gap-12 w-full">
				<SoloToolbar
					className={
						isConfigVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
					}
				/>

				<div className="relative w-full flex justify-center">
					{status === SoloStatusEnum.IDLE && (
						<div
							className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-lg cursor-pointer group"
							onClick={() => resumeFromIdle()}
						>
							<div className="text-xl font-bold text-white flex flex-col items-center gap-2 transition-transform group-hover:scale-110">
								<span>Click to resume</span>
								<span className="text-sm font-normal text-zinc-300">
									Your progress is saved
								</span>
							</div>
						</div>
					)}
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
							/>
						}
						controls={<RestartButton onReset={restart} />}
					/>
				</div>
			</div>
		);
	},
);
