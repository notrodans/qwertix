import { useEffect, useMemo, useRef, useState } from 'react';
import {
	calculateBackspace,
	calculateCursorIndex,
	TextDisplay,
	useCursorPositioning,
} from '@/entities/typing-text';

interface ReplayVisualizerProps {
	targetText: string;
	replayData: {
		key: string;
		timestamp: number;
		ctrlKey?: boolean;
		confirmedIndex?: number;
	}[];
	onComplete?: () => void;
}

export function ReplayVisualizer({
	targetText,
	replayData,
	onComplete,
}: ReplayVisualizerProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [playbackTime, setPlaybackTime] = useState(0);
	const [userTyped, setUserTyped] = useState('');
	const [caretPos, setCaretPos] = useState({ left: 0, top: 0 });

	const containerRef = useRef<HTMLDivElement>(null);
	const updateCursor = useCursorPositioning(containerRef, setCaretPos);
	const requestRef = useRef<number | undefined>(undefined);
	const lastTimeRef = useRef<number | undefined>(undefined);

	const totalDuration = useMemo(() => {
		if (!replayData.length) return 0;
		return replayData[replayData.length - 1]?.timestamp ?? 0;
	}, [replayData]);

	// Compute text state for a given timestamp
	const computeStateAtTime = (time: number) => {
		let currentText = '';

		for (const event of replayData) {
			if (event.timestamp > time) break;

			if (event.key === 'Backspace') {
				currentText = calculateBackspace(
					currentText,
					event.confirmedIndex ?? 0,
					!!event.ctrlKey,
				);
			} else if (event.key.length === 1) {
				currentText += event.key;
			}
		}
		return currentText;
	};

	// Animation Loop
	const animate = (time: number) => {
		if (lastTimeRef.current !== undefined) {
			const deltaTime = time - lastTimeRef.current;
			setPlaybackTime((prev) => {
				const nextTime = Math.min(prev + deltaTime, totalDuration);
				if (nextTime >= totalDuration) {
					setIsPlaying(false);
					onComplete?.();
				}
				return nextTime;
			});
		}
		lastTimeRef.current = time;
		if (isPlaying) {
			requestRef.current = requestAnimationFrame(animate);
		}
	};

	useEffect(() => {
		if (isPlaying) {
			lastTimeRef.current = undefined; // Reset delta tracking
			requestRef.current = requestAnimationFrame(animate);
		} else {
			if (requestRef.current !== undefined) {
				cancelAnimationFrame(requestRef.current);
			}
		}
		return () => {
			if (requestRef.current !== undefined) {
				cancelAnimationFrame(requestRef.current);
			}
		};
	}, [isPlaying, totalDuration]);

	// Sync UI with playbackTime
	useEffect(() => {
		const text = computeStateAtTime(playbackTime);
		setUserTyped(text);

		// Update cursor
		// Note: We need to do this in an effect or layout effect to ensure DOM is ready
		// But calculateCursorIndex is purely math, so we can do it here.
		// However, updateCursor reads DOM.
		requestAnimationFrame(() => {
			const index = calculateCursorIndex(targetText, text);
			updateCursor(index);
		});
	}, [playbackTime, replayData, targetText, updateCursor]);

	const togglePlay = () => {
		if (playbackTime >= totalDuration) {
			setPlaybackTime(0);
		}
		setIsPlaying(!isPlaying);
	};

	const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPlaybackTime(Number(e.target.value));
		// if playing, it continues from there
	};

	const formatTime = (ms: number) => {
		const s = Math.floor(ms / 1000);
		const m = Math.floor(s / 60);
		const rs = s % 60;
		return `${m}:${rs.toString().padStart(2, '0')}`;
	};

	return (
		<div className="w-full space-y-4">
			<div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
				<TextDisplay
					targetText={targetText}
					userTyped={userTyped}
					caretPos={caretPos}
					containerRef={containerRef}
					className="text-lg"
				/>
			</div>

			<div className="flex items-center gap-4 bg-zinc-900/50 p-2 rounded-lg">
				<button
					onClick={togglePlay}
					className="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition-colors"
				>
					{isPlaying ? '⏸' : '▶'}
				</button>

				<span className="font-mono text-sm text-zinc-400 min-w-[4ch]">
					{formatTime(playbackTime)}
				</span>

				<input
					type="range"
					min={0}
					max={totalDuration}
					value={playbackTime}
					onChange={handleSeek}
					className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
				/>

				<span className="font-mono text-sm text-zinc-500 min-w-[4ch]">
					{formatTime(totalDuration)}
				</span>
			</div>
		</div>
	);
}
