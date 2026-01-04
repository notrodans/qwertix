import {
	RaceModeEnum,
	type ReplayEvent,
	type RoomConfig,
} from '@qwertix/room-contracts';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTyping } from '@/entities/typing-text';
import { useInterval, useThrottledCallback } from '@/shared/lib';
import { useEventCallback } from '@/shared/lib/hooks/use-event-callback';

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
	const [isResultSaved, setIsResultSaved] = useState(false);
	const [timeLeft, setTimeLeft] = useState<number | null>(null);
	const [startTimeLocal, setStartTimeLocal] = useState<number | null>(null);

	const onSubmitCb = useEventCallback(onSubmit);

	// Throttled progress updater
	const throttledProgress = useThrottledCallback(onProgress, 200);

	const handleFinish = useCallback(
		(_typed: string, replay: ReplayEvent[]) => {
			if (submitted) return;

			// Calculated on backend
			onSubmitCb({
				wpm: 0,
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

	const handleResultSaved = useCallback((payload: { success: boolean }) => {
		if (payload.success) {
			setIsResultSaved(true);
		}
	}, []);

	const { userTyped, validLength, caretPos, replayData, startTime, reset } =
		useTyping(text, containerRef, {
			onType: (nextTyped) => {
				if (submitted) return; // Prevent typing after submit

				// Infinite scroll (Load more if cursor is near end, regardless of errors)
				// Use nextTyped.length (cursor position) to check buffer end.
				if (text.length - nextTyped.length < 150) {
					onLoadMore();
				}
			},
		});

	// Effect to trigger progress update when validLength changes
	// We do this in effect/render because validLength comes from state
	useEffect(() => {
		if (startTime && !submitted) {
			throttledProgress(validLength);
		}
	}, [validLength, startTime, submitted, throttledProgress]);

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
		isTimerRunning ? 1000 : 0,
	);

	const resetGame = useCallback(() => {
		setSubmitted(false);
		setIsResultSaved(false);
		setTimeLeft(null);
		setStartTimeLocal(null);
		reset();
	}, [reset]);

	return {
		userTyped,
		caretPos,
		timeLeft,
		containerRef,
		forceFinish,
		startTimer,
		handleResultSaved,
		isResultSaved,
		resetGame,
	};
}
