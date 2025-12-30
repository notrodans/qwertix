import { useEffect, useRef, useState } from 'react';
import type { Participant } from '@/entities/room';
import { TextDisplay, useTyping } from '@/entities/typing-text';

interface TypingStats {
	wpm: number;
	raw: number;
	accuracy: number;
	consistency: number;
	replayData: { key: string; timestamp: number }[];
}

interface MultiplayerBoardProps {
	text: string;
	onProgress: (progress: number, wpm: number) => void;
	onLoadMore: () => void;
	onSubmit: (stats: TypingStats) => void;
	status: 'COUNTDOWN' | 'RACING' | 'FINISHED';
	participants: Participant[];
	currentUser: Participant | undefined;
}

export function MultiplayerBoard({
	text,
	onProgress,
	onLoadMore,
	onSubmit,
	status,
	participants,
	currentUser,
}: MultiplayerBoardProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const { userTyped, caretPos, replayData } = useTyping(text, containerRef);
	const [startTime, setStartTime] = useState<number | null>(null);
	const [submitted, setSubmitted] = useState(false);

	useEffect(() => {
		if (status === 'RACING' && !startTime) {
			setStartTime(Date.now());
		}
	}, [status, startTime]);

	useEffect(() => {
		if (status !== 'RACING' || !startTime || submitted) return;

		// Calculate progress and WPM
		const progress = Math.min((userTyped.length / text.length) * 100, 100);

		const timeMinutes = (Date.now() - startTime) / 60000;
		const words = userTyped.length / 5;
		const wpm = timeMinutes > 0 ? words / timeMinutes : 0;

		// Throttle updates (e.g., every 500ms or on significant change)
		const timer = setTimeout(() => {
			onProgress(progress, wpm);
		}, 200);

		// Check if we need more words (infinite scroll)
		if (text.length - userTyped.length < 50) {
			onLoadMore();
		}

		// Check completion (for WORDS mode)
		if (userTyped.length === text.length && text.length > 0) {
			// Calculate accuracy: check how many chars match targetText
			let correct = 0;
			for (let i = 0; i < text.length; i++) {
				if (userTyped[i] === text[i]) correct++;
			}
			const accuracy = Math.round((correct / text.length) * 100);

			// Raw WPM: (all characters typed / 5) / time
			const raw = wpm; // In a real app, this would include errors too
			const consistency = 100; // Simplified for now

			onSubmit({ wpm, raw, accuracy, consistency, replayData });
			setSubmitted(true);
		}

		return () => clearTimeout(timer);
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
	]);

	// Handle Forced Finish (Time Mode)
	useEffect(() => {
		if (status === 'FINISHED' && !submitted && startTime) {
			const timeMinutes = (Date.now() - startTime) / 60000;
			const words = userTyped.length / 5;
			const wpm = timeMinutes > 0 ? words / timeMinutes : 0;

			onSubmit({ wpm, raw: wpm, accuracy: 100, consistency: 100, replayData });
			setSubmitted(true);
		}
	}, [status, submitted, startTime, userTyped, onSubmit, replayData]);

	return (
		<div className="w-full max-w-4xl mx-auto space-y-8">
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
