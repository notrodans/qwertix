import { RaceModeEnum, type ReplayEvent } from '@qwertix/room-contracts';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSessionStore } from '@/entities/session';
import {
	checkCompletion,
	useTyping,
	wordQueries,
} from '@/entities/typing-text';
import { useInterval } from '@/shared/lib';
import { SoloStatusEnum, useSoloModeStore } from './store';
import { useSaveSoloResult } from './use-save-solo-result';

export interface SoloGameResult {
	wpm: number;
	raw: number;
	accuracy: number;
	consistency: number;
	replayData: ReplayEvent[];
	fullText: string;
	afkDuration: number;
}

export function useSoloGame() {
	const {
		mode,
		duration,
		wordCount,
		status,
		setStatus,
		reset: resetStore,
	} = useSoloModeStore();

	const { user } = useSessionStore();
	const [timeLeft, setTimeLeft] = useState<number | null>(null);
	const [results, setResults] = useState<SoloGameResult | null>(null);
	const [extraWords, setExtraWords] = useState<string[]>([]);

	const { mutate: saveResult, isPending: isSaving } = useSaveSoloResult();

	const containerRef = useRef<HTMLDivElement>(null);
	const lastInputTime = useRef<number>(0);
	const afkDurationRef = useRef<number>(0);
	const blurStartTimeRef = useRef<number | null>(null);
	const [isFocused, setIsFocused] = useState(true);

	const initialCount = mode === RaceModeEnum.WORDS ? wordCount : 50;
	const { data: initialWords = [], refetch } = useQuery(
		wordQueries.list(initialCount),
	);

	// Focus/Blur Handling
	useEffect(() => {
		const handleBlur = () => {
			if (status === SoloStatusEnum.TYPING) {
				setIsFocused(false);
				blurStartTimeRef.current = Date.now();
			}
		};

		const handleFocus = () => {
			if (status === SoloStatusEnum.TYPING) {
				setIsFocused(true);
				if (blurStartTimeRef.current) {
					const duration = Date.now() - blurStartTimeRef.current;
					afkDurationRef.current += duration;
					blurStartTimeRef.current = null;
					// Reset input timer to avoid double counting the blur period as a "gap"
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

	const text = useMemo(
		() => [...initialWords, ...extraWords].join(' '),
		[initialWords, extraWords],
	);

	const loadMoreWords = async () => {
		try {
			const response = await fetch(`/api/words?count=50`);
			if (response.ok) {
				const newWords = await response.json();
				setExtraWords((prev) => [...prev, ...newWords]);
			}
		} catch (e) {
			console.error('Failed to load more words', e);
		}
	};

	const handleFinish = useCallback(
		(_currentTyped: string, replay: ReplayEvent[], startTime: number) => {
			if (status !== SoloStatusEnum.TYPING) return;

			const endTime = Date.now();
			// Check final gap
			const finalGap = endTime - lastInputTime.current;
			if (finalGap > 5000) {
				afkDurationRef.current += finalGap;
			}

			setStatus(SoloStatusEnum.RESULT);

			saveResult(
				{
					userId: user?.id,
					targetText: text,
					replayData: replay,
					startTime: startTime,
					endTime: endTime,
					consistency: 100,
					afkDuration: afkDurationRef.current,
				},
				{
					onSuccess: (savedResult) => {
						if (savedResult) {
							setResults({
								wpm: savedResult.wpm,
								raw: savedResult.raw,
								accuracy: savedResult.accuracy,
								consistency: savedResult.consistency,
								replayData: replay,
								fullText: text,
								afkDuration: afkDurationRef.current,
							});
						}
					},
					onError: () => {
						setResults({
							wpm: 0,
							raw: 0,
							accuracy: 0,
							consistency: 100,
							replayData: replay,
							fullText: text,
							afkDuration: afkDurationRef.current,
						});
					},
				},
			);
		},
		[status, setStatus, saveResult, text, user],
	);

	const restart = () => {
		refetch();
		setExtraWords([]);
		resetTyping();
		setTimeLeft(null);
		setResults(null);
		resetStore();
		afkDurationRef.current = 0;
	};

	const {
		userTyped,
		caretPos,
		reset: resetTyping,
		replayData,
		startTime: typingStartTime,
	} = useTyping(text, containerRef, {
		onStart: () => {
			setStatus(SoloStatusEnum.TYPING);
			lastInputTime.current = Date.now();
			afkDurationRef.current = 0;
			if (mode === RaceModeEnum.TIME) setTimeLeft(duration);
		},
		onType: (nextTyped, updatedReplayData) => {
			const now = Date.now();
			const gap = now - lastInputTime.current;
			if (gap > 5000) {
				afkDurationRef.current += gap;
			}
			lastInputTime.current = now;

			// Infinite scroll
			if (mode === RaceModeEnum.TIME && text.length - nextTyped.length < 150) {
				loadMoreWords();
			}
			// Completion for WORDS mode
			if (
				mode === RaceModeEnum.WORDS &&
				checkCompletion(nextTyped, text) &&
				text.length > 0
			) {
				handleFinish(nextTyped, updatedReplayData, typingStartTime || 0);
			}
		},
	});

	useInterval(
		() => {
			if (!typingStartTime) return;
			const now = Date.now();

			// We DO NOT reset on AFK anymore.
			// Just update timer if needed.

			if (mode === RaceModeEnum.TIME && duration) {
				const elapsed = (now - typingStartTime) / 1000;
				const remaining = Math.max(0, duration - elapsed);

				// Only update if value changed to avoid extra renders
				const nextTimeLeft = Math.ceil(remaining);
				setTimeLeft((prev) => (prev !== nextTimeLeft ? nextTimeLeft : prev));

				if (remaining <= 0) {
					handleFinish(userTyped, replayData, typingStartTime);
				}
			}
		},
		status === SoloStatusEnum.TYPING ? 100 : 0,
	);

	return {
		// State
		status,
		mode,
		duration,
		wordCount,
		timeLeft,
		results,
		text,
		userTyped,
		caretPos,
		containerRef,
		isSaving,
		isFocused,

		// Actions
		restart,
	};
}
