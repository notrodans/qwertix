import { RaceModeEnum, type ReplayEvent } from '@qwertix/room-contracts';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { useSessionStore } from '@/entities/session';
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

	const { user } = useSessionStore();
	const [timeLeft, setTimeLeft] = useState<number | null>(null);
	const [results, setResults] = useState<SoloGameResult | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [extraWords, setExtraWords] = useState<string[]>([]);

	const containerRef = useRef<HTMLDivElement>(null);

	const initialCount = mode === RaceModeEnum.WORDS ? wordCount : 100;
	const { data: initialWords = [], refetch } = useQuery(
		wordQueries.list(initialCount),
	);

	const allWords = [...initialWords, ...extraWords];
	const text = allWords.join(' ');

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
		async (currentTyped: string, replay: ReplayEvent[], startTime: number) => {
			if (status === 'RESULT') return;
			setIsSaving(true);
			setStatus('RESULT');

			try {
				const response = await fetch('/api/results', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						userId: user?.id,
						targetText: text,
						replayData: replay,
						startTime: startTime,
						endTime: Date.now(),
						consistency: 100,
					}),
				});

				if (response.ok) {
					const savedResult = await response.json();
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
				} else {
					// Fallback if server fails?
					setResults({
						wpm: 0,
						raw: 0,
						accuracy: 0,
						consistency: 100,
						replayData: replay,
						fullText: text,
					});
				}
			} catch (e) {
				console.error('Failed to save solo result', e);
			} finally {
				setIsSaving(false);
			}
		},
		[setStatus, text, user, status],
	);

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
				handleFinish(nextTyped, updatedReplayData, typingStartTime || 0);
			}
		},
	});

	// 4. Timer Logic
	const isTimeModeRunning =
		status === 'TYPING' &&
		mode === RaceModeEnum.TIME &&
		!!typingStartTime &&
		!!duration;

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
		isSaving,

		// Actions
		restart,
	};
}
