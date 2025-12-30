import { RaceModeEnum } from '@qwertix/room-contracts';
import { useEffect, useRef, useState } from 'react';
import type { Participant, RoomConfig } from '@/entities/room';
import { TextDisplay, useTyping } from '@/entities/typing-text';
import { calculateAccuracy, calculateWPM } from '../domain/metrics';

interface TypingStats {
	wpm: number;
	raw: number;
	accuracy: number;
	consistency: number;
	replayData: { key: string; timestamp: number }[];
	fullText: string;
}

interface MultiplayerBoardProps {
	text: string;
	config: RoomConfig;
	onProgress: (typedLength: number) => void;
	onLoadMore: () => void;
	onSubmit: (stats: TypingStats) => void;
	status: 'COUNTDOWN' | 'RACING' | 'FINISHED';
	participants: Participant[];
	currentUser: Participant | undefined;
}

export function MultiplayerBoard({
	text,
	config,
	onProgress,
	onLoadMore,
	onSubmit,
	status,
	participants,
	currentUser,
}: MultiplayerBoardProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const { userTyped, caretPos, replayData, setUserTyped } = useTyping(
		text,
		containerRef,
	);
	const [startTime, setStartTime] = useState<number | null>(null);
	const [submitted, setSubmitted] = useState(false);
	const [timeLeft, setTimeLeft] = useState<number | null>(null);
	const [accumulatedLength, setAccumulatedLength] = useState(0);
	const [fullText, setFullText] = useState(text);

	// Handle new word chunks
	const prevTextRef = useRef(text);
	useEffect(() => {
		if (prevTextRef.current !== text) {
			if (config.mode === RaceModeEnum.TIME) {
				setAccumulatedLength((prev) => prev + userTyped.length + 1); // +1 for space
				setUserTyped('');
				setFullText((prev) => `${prev} ${text}`);
			} else {
				setFullText(text); // In WORDS mode, text is usually stable or appends
			}
		}
		prevTextRef.current = text;
	}, [text, config.mode, setUserTyped, userTyped.length]);

	useEffect(() => {
		if (status === 'RACING' && !startTime) {
			setStartTime(Date.now());
		}
	}, [status, startTime]);

	// Timer for Time Mode
	useEffect(() => {
		if (
			status === 'RACING' &&
			startTime &&
			config.mode === RaceModeEnum.TIME &&
			config.duration
		) {
			const interval = setInterval(() => {
				const elapsed = (Date.now() - startTime) / 1000;
				const remaining = Math.max(0, config.duration - elapsed);
				setTimeLeft(Math.ceil(remaining));

				if (remaining <= 0) {
					clearInterval(interval);
				}
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [status, startTime, config]);

	useEffect(() => {
		if (status !== 'RACING' || !startTime || submitted) {
			return;
		}

		// Calculate progress and WPM for local display (optional, but keep for now)
		const currentTypedLength = accumulatedLength + userTyped.length;

		// Throttle updates to server
		const timer = setTimeout(() => {
			onProgress(currentTypedLength);
		}, 200);

		// Check if we need more words (infinite scroll)
		if (text.length - userTyped.length < 50) {
			onLoadMore();
		}

		// Check completion (for WORDS mode)
		if (
			config.mode === RaceModeEnum.WORDS &&
			userTyped.length === text.length &&
			text.length > 0
		) {
			const accuracy = calculateAccuracy(userTyped, text);
			const wpm = calculateWPM(currentTypedLength, startTime, Date.now());
			onSubmit({
				wpm,
				raw: wpm,
				accuracy,
				consistency: 100,
				replayData,
				fullText,
			});
			setSubmitted(true);
		}

		return () => {
			clearTimeout(timer);
		};
	}, [
		userTyped,
		status,
		startTime,
		onProgress,
		text.length,
		onLoadMore,
		onSubmit,
		submitted,
		replayData,
		text,
		config,
		accumulatedLength,
		fullText,
	]);

	// Handle Forced Finish (Time Mode)
	useEffect(() => {
		if (status === 'FINISHED' && !submitted && startTime) {
			const currentTypedLength = accumulatedLength + userTyped.length;
			const wpm = calculateWPM(currentTypedLength, startTime, Date.now());

			onSubmit({
				wpm,
				raw: wpm,
				accuracy: 100,
				consistency: 100,
				replayData,
				fullText,
			});
			setSubmitted(true);
		}
	}, [
		status,
		submitted,
		startTime,
		userTyped,
		onSubmit,
		replayData,
		accumulatedLength,
		fullText,
	]);

	const remainingWords =
		config.mode === RaceModeEnum.WORDS
			? text.split(' ').length - userTyped.split(' ').length + 1
			: null;

	return (
		<div className="w-full max-w-4xl mx-auto space-y-8">
			{/* Indicators */}
			<div className="flex justify-center text-4xl font-black text-yellow-500 font-mono h-12">
				{config.mode === RaceModeEnum.TIME && timeLeft !== null && (
					<div className="animate-pulse">{timeLeft}s</div>
				)}
				{config.mode === RaceModeEnum.WORDS && remainingWords !== null && (
					<div>{remainingWords} words left</div>
				)}
			</div>

			{/* Opponents Progress */}
			<div className="space-y-2 bg-gray-900/50 p-4 rounded-lg">
				{participants
					.filter((p) => p.socketId !== currentUser?.socketId)
					.map((p) => (
						<div key={p.socketId} className="flex items-center gap-4 text-sm">
							<span className="w-20 truncate text-right">{p.username}</span>
							<div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
								<div
									className="h-full bg-red-500 transition-all duration-300"
									style={{ width: `${p.progress}%` }}
								/>
							</div>
							<span className="w-12 font-mono">{Math.round(p.wpm)}</span>
						</div>
					))}
			</div>

			{/* My Board */}
			<div
				className={`transition-opacity duration-300 ${status === 'COUNTDOWN' ? 'opacity-50 blur-sm' : 'opacity-100'}`}
			>
				<TextDisplay
					targetText={text}
					userTyped={userTyped}
					caretPos={caretPos}
					containerRef={containerRef}
					className="wrap-break-word text-justify text-2xl leading-relaxed"
				/>
			</div>

			{status === 'COUNTDOWN' && (
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
					<div className="text-6xl font-bold text-yellow-400 animate-ping">
						GET READY
					</div>
				</div>
			)}
		</div>
	);
}
