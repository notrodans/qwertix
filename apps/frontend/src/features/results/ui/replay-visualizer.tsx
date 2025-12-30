import { useEffect, useRef, useState } from 'react';
import {
	calculateCursorIndex,
	TextDisplay,
	useCursorPositioning,
} from '@/entities/typing-text';

interface ReplayVisualizerProps {
	targetText: string;
	replayData: { key: string; timestamp: number }[];
	onComplete?: () => void;
}

export function ReplayVisualizer({
	targetText,
	replayData,
	onComplete,
}: ReplayVisualizerProps) {
	const [userTyped, setUserTyped] = useState('');
	const [currentIndex, setCurrentIndex] = useState(0);
	const [caretPos, setCaretPos] = useState({ left: 0, top: 0 });
	const containerRef = useRef<HTMLDivElement>(null);
	const updateCursor = useCursorPositioning(containerRef, setCaretPos);

	useEffect(() => {
		if (currentIndex >= replayData.length) {
			onComplete?.();
			return;
		}

		const event = replayData[currentIndex];
		const prevTimestamp =
			currentIndex > 0 ? replayData[currentIndex - 1].timestamp : 0;
		const delay = event.timestamp - prevTimestamp;

		const timeout = setTimeout(() => {
			const key = event.key;
			let nextTyped = userTyped;

			if (key === 'Backspace') {
				// Simplified backspace for replay (assuming no ctrl+backspace stored or handled simply)
				// If we stored ctrl+backspace, we'd need that info.
				// For now assuming simple backspace.
				// Actually my useTyping records 'Backspace' only.
				// Ideally replayData should include modifiers or full state.
				// Falling back to simple char removal if simple 'Backspace'.
				nextTyped = userTyped.slice(0, -1);
			} else if (key.length === 1) {
				nextTyped = userTyped + key;
			}

			setUserTyped(nextTyped);
			const nextIndex = calculateCursorIndex(targetText, nextTyped);
			requestAnimationFrame(() => updateCursor(nextIndex));
			setCurrentIndex((prev) => prev + 1);
		}, delay);

		return () => clearTimeout(timeout);
	}, [
		currentIndex,
		replayData,
		userTyped,
		targetText,
		updateCursor,
		onComplete,
	]);

	return (
		<div className="w-full p-4 bg-zinc-900 rounded-lg">
			<TextDisplay
				targetText={targetText}
				userTyped={userTyped}
				caretPos={caretPos}
				containerRef={containerRef}
				className="text-lg"
			/>
		</div>
	);
}
