import { RaceModeEnum, type ReplayEvent } from '@qwertix/room-contracts';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useRef, useState } from 'react';
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

	const initialCount = mode === RaceModeEnum.WORDS ? wordCount : 50;
	const { data: initialWords = [], refetch } = useQuery(
		wordQueries.list(initialCount),
	);

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
			setStatus(SoloStatusEnum.RESULT);

			saveResult(
				{
					userId: user?.id,
					targetText: text,
					replayData: replay,
					startTime: startTime,
					endTime: Date.now(),
					consistency: 100,
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
						});
					},
				},
			);
		},
		[status, setStatus, saveResult, text, user],
	);

	const {
		userTyped,
		caretPos,
		reset: resetTyping,
		replayData,
		startTime: typingStartTime,
	} = useTyping(text, containerRef, {
		onStart: () => {
			setStatus(SoloStatusEnum.TYPING);
			if (mode === RaceModeEnum.TIME) setTimeLeft(duration);
		},
		onType: (nextTyped, updatedReplayData) => {
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

	const isTimeModeRunning = useMemo(
		() =>
			status === SoloStatusEnum.TYPING &&
			mode === RaceModeEnum.TIME &&
			!!typingStartTime &&
			!!duration,
		[status, mode, typingStartTime, duration],
	);

	useInterval(
		() => {
			if (!typingStartTime) return;
			const now = Date.now();
			const elapsed = (now - typingStartTime) / 1000;
			const remaining = Math.max(0, duration - elapsed);

			// Only update if value changed to avoid extra renders
			const nextTimeLeft = Math.ceil(remaining);
			setTimeLeft((prev) => (prev !== nextTimeLeft ? nextTimeLeft : prev));

			if (remaining <= 0) {
				handleFinish(userTyped, replayData, typingStartTime);
			}
		},
		isTimeModeRunning ? 100 : 0,
	);

	const restart = () => {
		refetch();
		setExtraWords([]);
		resetTyping();
		setTimeLeft(null);
		setResults(null);
		resetStore();
	};

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

		// Actions
		restart,
	};
}
