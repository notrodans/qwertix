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
import { cn } from '@/shared/lib/utils';
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
	children?: ReactNode;
}

export const SoloTypingMediator = reatomComponent(
	({ renderResults, children }: SoloTypingMediatorProps) => {
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

		const isResultsView = status === SoloStatusEnum.RESULT;
		const typedWordsCount = userTyped.split(' ').length - 1;

		return (
			<div className="relative w-full max-w-4xl mx-auto min-h-100">
				{/* Results View Layer */}
				<div
					className={cn(
						'absolute inset-0 transition-opacity duration-500 ease-in-out',
						{
							'opacity-100 z-10 pointer-events-auto': isResultsView,
							'opacity-0 z-0 pointer-events-none': !isResultsView,
						},
					)}
				>
					{isSaving ? (
						<div className="flex flex-col items-center justify-center h-full gap-4">
							<TypingStatusIndicator state="loading" />
							<div className="text-zinc-400 font-medium">
								Calculating results...
							</div>
						</div>
					) : results && renderResults ? (
						renderResults(results, restart)
					) : null}
				</div>

				{/* Typing View Layer */}
				<div
					className={cn(
						'flex flex-col items-center gap-12 w-full transition-opacity duration-500 ease-in-out',
						{
							'opacity-100 z-10 pointer-events-auto': !isResultsView,
							'opacity-0 z-0 pointer-events-none': isResultsView,
						},
					)}
				>
					<SoloToolbar
						className={
							status !== SoloStatusEnum.TYPING
								? 'opacity-100'
								: 'opacity-0 pointer-events-none'
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
					{children}
				</div>
			</div>
		);
	},
);
