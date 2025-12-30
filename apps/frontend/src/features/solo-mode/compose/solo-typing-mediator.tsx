import { RaceModeEnum } from '@qwertix/room-contracts';
import { useQuery } from '@tanstack/react-query';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
	calculateAccuracy,
	calculateWPM,
	RestartButton,
	TextDisplay,
	TypingSessionLayout,
	TypingStatusIndicator,
	useTyping,
	wordQueries,
} from '@/entities/typing-text';
import { useSoloModeStore } from '../model/store';
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
	const { mode, duration, wordCount, status, setStatus, reset } =
		useSoloModeStore();
	const [startTime, setStartTime] = useState<number | null>(null);
	const [timeLeft, setTimeLeft] = useState<number | null>(null);
	const [results, setResults] = useState<SoloResult | null>(null);

	// Fetch words based on mode
	// For TIME mode, we fetch a large enough initial set (e.g. 100)
	const initialCount = mode === RaceModeEnum.WORDS ? wordCount : 100;
	const {
		data: words,
		isLoading,
		isError,
		refetch,
	} = useQuery(wordQueries.list(initialCount));

	const containerRef = useRef<HTMLDivElement>(null);
	const text = words ? words.join(' ') : '';
	const {
		userTyped,
		caretPos,
		reset: resetTyping,
		replayData,
	} = useTyping(text, containerRef);

	// Timer for TIME mode
	useEffect(() => {
		if (
			status === 'TYPING' &&
			mode === RaceModeEnum.TIME &&
			startTime &&
			duration
		) {
			const interval = setInterval(() => {
				const elapsed = (Date.now() - startTime) / 1000;
				const remaining = Math.max(0, duration - elapsed);
				setTimeLeft(Math.ceil(remaining));

				if (remaining <= 0) {
					clearInterval(interval);
					handleFinish();
				}
			}, 100);
			return () => clearInterval(interval);
		}
	}, [status, mode, startTime, duration]);

	// Start typing detection
	useEffect(() => {
		if (status === 'START' && userTyped.length > 0) {
			setStatus('TYPING');
			setStartTime(Date.now());
			if (mode === RaceModeEnum.TIME) setTimeLeft(duration);
		}
	}, [userTyped, status, setStatus, mode, duration]);

	// Completion for WORDS mode
	useEffect(() => {
		if (
			status === 'TYPING' &&
			mode === RaceModeEnum.WORDS &&
			userTyped.length === text.length &&
			text.length > 0
		) {
			handleFinish();
		}
	}, [userTyped, text, status, mode]);

	const handleFinish = () => {
		const endTime = Date.now();
		const finalStartTime = startTime || endTime;
		const wpm = calculateWPM(userTyped.length, finalStartTime, endTime);
		const accuracy = calculateAccuracy(userTyped, text);

		setResults({
			wpm,
			raw: wpm,
			accuracy,
			consistency: 100, // TODO: Implement consistency
			replayData,
			fullText: text,
		});
		setStatus('RESULT');
	};

	const handleRestart = () => {
		refetch();
		resetTyping();
		setStartTime(null);
		setTimeLeft(null);
		setResults(null);
		reset();
	};

	if (status === 'RESULT' && results) {
		return renderResults ? (
			renderResults(results, handleRestart)
		) : (
			<div>Run complete! WPM: {results.wpm}</div>
		);
	}

	return (
		<div className="flex flex-col items-center gap-12 w-full">
			<SoloToolbar />

			<TypingSessionLayout
				state={isLoading ? 'loading' : isError ? 'error' : 'ready'}
				loadingFallback={<TypingStatusIndicator state="loading" />}
				errorFallback={<TypingStatusIndicator state="error" />}
				config={
					<div className="flex flex-col items-center gap-2">
						<div className="text-2xl font-black text-yellow-500 font-mono h-8">
							{mode === RaceModeEnum.TIME && timeLeft !== null && (
								<div className="animate-pulse">{timeLeft}</div>
							)}
							{mode === RaceModeEnum.WORDS && (
								<div className="text-sm text-zinc-500">
									{userTyped.split(' ').length - 1} / {wordCount}
								</div>
							)}
						</div>
					</div>
				}
				board={
					<TextDisplay
						targetText={text}
						userTyped={userTyped}
						caretPos={caretPos}
						containerRef={containerRef}
						className="wrap-break-word text-justify"
					/>
				}
				controls={<RestartButton onReset={handleRestart} />}
			/>
		</div>
	);
}
