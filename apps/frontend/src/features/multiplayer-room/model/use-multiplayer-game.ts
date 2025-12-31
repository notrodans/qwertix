import {
	RaceModeEnum,
	type ReplayEvent,
	type RoomConfig,
} from '@qwertix/room-contracts';
import { useCallback, useRef, useState } from 'react';
import { useTyping } from '@/entities/typing-text';
import { useInterval, useThrottledCallback } from '@/shared/lib';

interface TypingStats {
	wpm: number;
	raw: number;
	accuracy: number;
	consistency: number;
	replayData: ReplayEvent[];
	fullText: string;
}

interface UseMultiplayerGameProps {
	text: string;
	config: RoomConfig;
	onProgress: (length: number) => void;
	onLoadMore: () => void;
	onSubmit: (stats: TypingStats) => void;
}

export function useMultiplayerGame({
	text,
	config,
	onProgress,
	onLoadMore,
	onSubmit,
}: UseMultiplayerGameProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [submitted, setSubmitted] = useState(false);
	const [timeLeft, setTimeLeft] = useState<number | null>(null);
	const [startTimeLocal, setStartTimeLocal] = useState<number | null>(null);

	// Throttled progress updater
	const throttledProgress = useThrottledCallback(onProgress, 200);

	const handleFinish = useCallback(
		(_typed: string, replay: ReplayEvent[]) => {
			if (submitted) return;

			onSubmit({
				wpm: 0, // Calculated on backend
				raw: 0,
				accuracy: 0,
				consistency: 100,
				replayData: replay,
				fullText: text,
			});
			setSubmitted(true);
		},
		[submitted, onSubmit, text],
	);

	const { userTyped, caretPos, replayData, startTime } = useTyping(
		text,
		containerRef,
		{
			onType: (nextTyped, updatedReplayData) => {
				if (submitted) return; // Prevent typing after submit

				throttledProgress(nextTyped.length);

				// Infinite scroll
				if (
					config.mode === RaceModeEnum.TIME &&
					text.length - nextTyped.length < 150
				) {
					onLoadMore();
				}

				// Completion for WORDS mode
				if (
					config.mode === RaceModeEnum.WORDS &&
					nextTyped.length === text.length &&
					text.length > 0
				) {
					handleFinish(nextTyped, updatedReplayData);
				}
			},
		},
	);

	// Public methods for external control (e.g. from socket events)
	const forceFinish = useCallback(() => {
		if (!submitted && startTime) {
			handleFinish(userTyped, replayData);
		}
	}, [submitted, startTime, userTyped, replayData, handleFinish]);

	const startTimer = useCallback(() => {
		setStartTimeLocal(Date.now());
	}, []);

	// Timer Logic
	const isTimerRunning = !!(
		startTimeLocal &&
		config.mode === RaceModeEnum.TIME &&
		config.duration
	);

	useInterval(
		() => {
			if (!startTimeLocal || config.mode !== RaceModeEnum.TIME) return;
			const elapsed = (Date.now() - startTimeLocal) / 1000;
			const remaining = Math.max(0, config.duration - elapsed);
			setTimeLeft(Math.ceil(remaining));
		},
		isTimerRunning ? 1000 : null,
	);

	return {
		userTyped,
		caretPos,
		timeLeft,
		containerRef,
		forceFinish,
		startTimer,
	};
}
