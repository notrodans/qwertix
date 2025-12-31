import { useState } from 'react';
import { ReplayVisualizer } from '../replay-visualizer';

interface ReplaySectionProps {
	targetText: string;
	replayData: { key: string; timestamp: number }[];
}

export function ReplaySection({ targetText, replayData }: ReplaySectionProps) {
	const [showReplay, setShowReplay] = useState(false);

	return (
		<div className="flex-1 space-y-4">
			<h3 className="text-xl font-bold text-zinc-400">Replay</h3>
			{showReplay ? (
				<ReplayVisualizer
					targetText={targetText}
					replayData={replayData}
					onComplete={() => console.log('Replay finished')}
				/>
			) : (
				<div className="h-48 bg-zinc-800 rounded-lg flex items-center justify-center border-2 border-dashed border-zinc-700">
					<button
						onClick={() => setShowReplay(true)}
						className="px-6 py-2 bg-emerald-500 text-black font-bold rounded-md hover:bg-emerald-400 transition-colors"
					>
						Watch Replay
					</button>
				</div>
			)}
		</div>
	);
}
