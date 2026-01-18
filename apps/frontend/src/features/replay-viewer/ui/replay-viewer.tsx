import { reatomComponent } from '@reatom/react';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ReplayResponse } from '@/entities/result';
import { TextDisplay, useCursorPositioning } from '@/entities/typing-text';
import { createReplayModel } from '../model/replay-model';

interface ReplayViewerProps {
	replay: ReplayResponse;
}

export const ReplayViewer = reatomComponent(({ replay }: ReplayViewerProps) => {
	// Create isolated model instance for this replay
	const model = useMemo(() => createReplayModel(replay), [replay]);

	// Activate animation service
	model.animationAtom();

	const isPlaying = model.isPlayingAtom();
	const progress = model.progressAtom();
	const typedText = model.typedTextAtom();
	const cursorIndex = model.cursorIndexAtom();

	const containerRef = useRef<HTMLDivElement>(null);
	const [caretPos, setCaretPos] = useState({ left: 0, top: 0 });
	const updateCursor = useCursorPositioning(containerRef, setCaretPos);

	// Update cursor when index changes
	useLayoutEffect(() => {
		updateCursor(cursorIndex);
	}, [cursorIndex, updateCursor]);

	const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = parseFloat(e.target.value);
		model.setProgressManual(val);
	};

	return (
		<div className="w-full max-w-4xl space-y-6">
			<div className="p-8 bg-muted/30 rounded-xl border border-border shadow-inner">
				<TextDisplay
					targetText={replay.targetText || ''}
					userTyped={typedText}
					caretPos={caretPos}
					containerRef={containerRef}
					className="text-2xl"
				/>
			</div>

			<div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border">
				<button
					onClick={() => model.togglePlay()}
					className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded transition-colors cursor-pointer"
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
					className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
				/>
				<span className="text-muted-foreground font-mono w-16 text-right">
					{Math.round(progress * 100)}%
				</span>
			</div>
		</div>
	);
});
