import {
	RaceModeEnum,
	type ReplayEvent,
	type RoomConfig,
	RoomStatusEnum,
} from '@qwertix/room-contracts';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTyping } from '@/entities/typing-text';
import {
	useEventCallback,
	useInterval,
	useThrottledCallback,
} from '@/shared/lib';

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
	status: RoomStatusEnum;
	startTime?: number;
	onProgress: (length: number) => void;
	onLoadMore: () => void;
	onSubmit: (stats: TypingStats) => void;
}

export function useMultiplayerGame({
	text,
	config,
	status,
	startTime,
	onProgress,
	onLoadMore,
	onSubmit,
}: UseMultiplayerGameProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [submitted, setSubmitted] = useState(false);
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
		[submitted, text, onSubmitCb],
	);

	const { userTyped, validLength, caretPos, replayData, reset } = useTyping(
		text,
		containerRef,
		{
			onType: (nextTyped) => {
				if (submitted) return;

				if (text.length - nextTyped.length < 150) {
					onLoadMore();
				}
			},
		},
	);

	// React to Room Status changes
	useEffect(() => {
		if (status === RoomStatusEnum.RACING && !startTimeLocal) {
			setStartTimeLocal(Date.now());
		} else if (status === RoomStatusEnum.FINISHED && !submitted) {
			handleFinish(userTyped, replayData);
		} else if (status === RoomStatusEnum.LOBBY) {
			setSubmitted(false);
			setTimeLeft(null);
			setStartTimeLocal(null);
			reset();
		}
	}, [
		status,
		startTimeLocal,
		submitted,
		handleFinish,
		userTyped,
		replayData,
		reset,
	]);

	// Effect to trigger progress update when validLength changes
	useEffect(() => {
		if (status === RoomStatusEnum.RACING && !submitted) {
			throttledProgress(validLength);
		}
	}, [validLength, status, submitted, throttledProgress]);

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

	return {
		userTyped,
		validLength,
		caretPos,
		timeLeft,
		containerRef,
	};
}
