import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { ReplayEvent, ReplayResponse } from '@/entities/result';
import {
	appendCharacter,
	calculateBackspace,
	calculateCursorIndex,
	TextDisplay,
	useCursorPositioning,
} from '@/entities/typing-text';

interface ReplayViewerProps {
	replay: ReplayResponse;
}

function reconstructTextAtTime(
	replayData: ReplayEvent[],
	targetTimestamp: number,
	targetText: string,
): string {
	let reconstructedTypedText = '';
	for (const event of replayData) {
		if (event.timestamp > targetTimestamp) break;

		if (event.key === 'Backspace') {
			const isCtrl = !!event.ctrlKey;
			const confirmedIndex = event.confirmedIndex ?? 0;

			reconstructedTypedText = calculateBackspace(
				reconstructedTypedText,
				confirmedIndex,
				isCtrl,
			);
		} else if (event.key.length === 1) {
			reconstructedTypedText = appendCharacter(
				reconstructedTypedText,
				event.key,
				targetText,
			);
		}
	}
	return reconstructedTypedText;
}

export function ReplayViewer({ replay }: ReplayViewerProps) {
	const [typedText, setTypedText] = useState('');
	const [isPlaying, setIsPlaying] = useState(false);
	const [progress, setProgress] = useState(0); // 0 to 1
	const animationFrameRef = useRef<number>(null);
	const startTimeRef = useRef<number>(0);
	const lastProgressRef = useRef<number>(0); // To support pause/resume

	const containerRef = useRef<HTMLDivElement>(null);
	const [caretPos, setCaretPos] = useState({ left: 0, top: 0 });
	const updateCursor = useCursorPositioning(containerRef, setCaretPos);

	const { data: events, targetText } = replay;
	// Calculate duration based on first and last event, or at least 1000ms
	const duration = Math.max(
		(events[events.length - 1]?.timestamp ?? 0) - (events[0]?.timestamp ?? 0),
		1000,
	);
	const firstTimestamp =
		events && events.length > 0 ? (events[0]?.timestamp ?? 0) : 0;

	// Memoized function to update text based on progress
	const updateText = useCallback(
		(prog: number) => {
			if (!events || events.length === 0) return;
			const currentTimestamp = firstTimestamp + prog * duration;
			const text = reconstructTextAtTime(
				events,
				currentTimestamp,
				targetText || '',
			);
			setTypedText(text);
		},
		[events, duration, firstTimestamp, targetText],
	);

	const animate = (time: number) => {
		const elapsed = time - startTimeRef.current;
		const currentProgress = Math.min(
			elapsed / duration + lastProgressRef.current,
			1,
		);

		setProgress(currentProgress);
		updateText(currentProgress);

		if (currentProgress < 1) {
			animationFrameRef.current = requestAnimationFrame(animate);
		} else {
			setIsPlaying(false);
			lastProgressRef.current = 1;
		}
	};

	const play = () => {
		if (isPlaying) return;
		if (progress >= 1) {
			// Restart
			setProgress(0);
			lastProgressRef.current = 0;
		}
		setIsPlaying(true);
		startTimeRef.current = performance.now();
		animationFrameRef.current = requestAnimationFrame(animate);
	};

	const pause = () => {
		setIsPlaying(false);
		if (animationFrameRef.current) {
			cancelAnimationFrame(animationFrameRef.current);
		}
		lastProgressRef.current = progress;
	};

	const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = parseFloat(e.target.value);
		pause();
		setProgress(val);
		lastProgressRef.current = val;
		updateText(val);
	};

	// Update cursor when text changes
	useLayoutEffect(() => {
		const index = calculateCursorIndex(targetText || '', typedText);
		updateCursor(index);
	}, [typedText, targetText, updateCursor]);

	return (
		<div className="w-full max-w-4xl space-y-6">
			<div className="p-8 bg-zinc-900/50 rounded-xl border border-zinc-800 shadow-inner">
				<TextDisplay
					targetText={targetText || ''}
					userTyped={typedText}
					caretPos={caretPos}
					containerRef={containerRef}
					className="text-2xl"
				/>
			</div>

			<div className="flex items-center gap-4 bg-zinc-900 p-4 rounded-lg border border-zinc-800">
				<button
					onClick={isPlaying ? pause : play}
					className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-bold rounded transition-colors"
				>
					{isPlaying ? 'Pause' : 'Play'}
				</button>

				<input
					type="range"
					min="0"
					max="1"
					step="0.001"
					value={progress}
					onChange={handleSliderChange}
					className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
				/>
				<span className="text-zinc-400 font-mono w-16 text-right">
					{Math.round(progress * 100)}%
				</span>
			</div>
		</div>
	);
}
