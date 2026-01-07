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
	afkDuration: number;
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
	startTime: _startTime,
	onProgress,
	onLoadMore,
	onSubmit,
}: UseMultiplayerGameProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [submitted, setSubmitted] = useState(false);
	const [timeLeft, setTimeLeft] = useState<number | null>(null);
	const [startTimeLocal, setStartTimeLocal] = useState<number | null>(null);
	const [isFocused, setIsFocused] = useState(true);

	const lastInputTime = useRef<number>(0);
	const afkDurationRef = useRef<number>(0);
	const blurStartTimeRef = useRef<number | null>(null);

	const onSubmitCb = useEventCallback(onSubmit);

	// Throttled progress updater
	const throttledProgress = useThrottledCallback(onProgress, 200);

	// Focus/Blur Handling
	useEffect(() => {
		const handleBlur = () => {
			if (status === RoomStatusEnum.RACING) {
				setIsFocused(false);
				blurStartTimeRef.current = Date.now();
			}
		};

		const handleFocus = () => {
			if (status === RoomStatusEnum.RACING) {
				setIsFocused(true);
				if (blurStartTimeRef.current) {
					const duration = Date.now() - blurStartTimeRef.current;
					afkDurationRef.current += duration;
					blurStartTimeRef.current = null;
					lastInputTime.current = Date.now();
				}
			}
		};

		window.addEventListener('blur', handleBlur);
		window.addEventListener('focus', handleFocus);
		return () => {
			window.removeEventListener('blur', handleBlur);
			window.removeEventListener('focus', handleFocus);
		};
	}, [status]);

	const handleFinish = useCallback(
		(_typed: string, replay: ReplayEvent[]) => {
			if (submitted) return;

			// Check final gap
			const endTime = Date.now();
			const finalGap = endTime - lastInputTime.current;
			if (finalGap > 5000) {
				afkDurationRef.current += finalGap;
			}

			// Calculated on backend
			onSubmitCb({
				wpm: 0,
				raw: 0,
				accuracy: 0,
				consistency: 100,
				replayData: replay,
				fullText: text,
				afkDuration: afkDurationRef.current,
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

				const now = Date.now();
				const gap = now - lastInputTime.current;
				if (gap > 5000) {
					afkDurationRef.current += gap;
				}
				lastInputTime.current = now;

				if (text.length - nextTyped.length < 150) {
					onLoadMore();
				}
			},
		},
	);

	// React to Room Status changes
	useEffect(() => {
		if (status === RoomStatusEnum.RACING && !startTimeLocal) {
			const now = Date.now();
			setStartTimeLocal(now);
			lastInputTime.current = now;
			afkDurationRef.current = 0;
			setIsFocused(true);
		} else if (status === RoomStatusEnum.FINISHED && !submitted) {
			handleFinish(userTyped, replayData);
		} else if (status === RoomStatusEnum.LOBBY) {
			setSubmitted(false);
			setTimeLeft(null);
			setStartTimeLocal(null);
			reset();
			afkDurationRef.current = 0;
			setIsFocused(true);
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
		isFocused,
	};
}
