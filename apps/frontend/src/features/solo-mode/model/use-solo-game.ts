import { RaceModeEnum, type ReplayEvent } from '@qwertix/room-contracts';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { useTyping, wordQueries } from '@/entities/typing-text';
import { useInterval } from '@/shared/lib';
import { useSoloModeStore } from './store';

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

	const [timeLeft, setTimeLeft] = useState<number | null>(null);
	const [results, setResults] = useState<SoloGameResult | null>(null);
	const [extraWords, setExtraWords] = useState<string[]>([]);

	const containerRef = useRef<HTMLDivElement>(null);

	// 1. Data Fetching
	const initialCount = mode === RaceModeEnum.WORDS ? wordCount : 100;
	const { data: initialWords = [], refetch } = useQuery(
		wordQueries.list(initialCount),
	);

	const allWords = [...initialWords, ...extraWords];
	const text = allWords.join(' ');

	// 2. Logic Methods
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
		(_currentTyped: string, replay: ReplayEvent[], _startTime: number) => {
			const wpm = 0;
			const accuracy = 0;

			setResults({
				wpm,
				raw: wpm,
				accuracy,
				consistency: 100,
				replayData: replay,
				fullText: text,
			});
			setStatus('RESULT');
		},
		[setStatus, text],
	);

	// 3. Typing Hook
	const {
		userTyped,
		caretPos,
		reset: resetTyping,
		replayData,
		startTime: typingStartTime,
	} = useTyping(text, containerRef, {
		onStart: () => {
			setStatus('TYPING');
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
				nextTyped.length === text.length &&
				text.length > 0
			) {
				handleFinish(
					nextTyped,
					updatedReplayData,
					0, // Start time is not used for calculation here anymore
				);
			}
		},
	});

	// 4. Timer Logic
	const isTimeModeRunning =
		status === 'TYPING' &&
		mode === RaceModeEnum.TIME &&
		typingStartTime &&
		duration;

	useInterval(
		() => {
			if (!typingStartTime) return;
			const elapsed = (Date.now() - typingStartTime) / 1000;
			const remaining = Math.max(0, duration - elapsed);
			setTimeLeft(Math.ceil(remaining));

			if (remaining <= 0) {
				handleFinish(userTyped, replayData, typingStartTime);
			}
		},
		isTimeModeRunning ? 100 : null,
	);

	// 5. Restart Logic
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

		// Actions
		restart,
	};
}
