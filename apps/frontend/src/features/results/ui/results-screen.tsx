import { useState } from 'react';
import type { Participant } from '@/entities/room';
import { formatAccuracy, formatConsistency, formatWPM } from '../domain/format';
import { ReplayVisualizer } from './replay-visualizer';

interface ResultsScreenProps {
	stats: {
		wpm: number;
		raw: number;
		accuracy: number;
		consistency: number;
		replayData: { key: string; timestamp: number }[];
	};
	targetText: string;
	participants: Participant[];
	isHost?: boolean;
	onRestart?: () => void;
	onClose: () => void;
}

export function ResultsScreen({
	stats,
	targetText,
	participants,
	isHost,
	onRestart,
	onClose,
}: ResultsScreenProps) {
	const [showReplay, setShowReplay] = useState(false);

	return (
		<div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 overflow-y-auto p-4">
			<div className="bg-zinc-900 w-full max-w-4xl rounded-2xl border border-zinc-800 p-8 space-y-8">
				<div className="grid grid-cols-4 gap-4">
					<StatBox
						label="WPM"
						value={formatWPM(stats.wpm)}
						color="text-emerald-400"
					/>
					<StatBox
						label="ACC"
						value={formatAccuracy(stats.accuracy)}
						color="text-yellow-400"
					/>
					<StatBox
						label="RAW"
						value={formatWPM(stats.raw)}
						color="text-zinc-400"
					/>
					<StatBox
						label="CONS"
						value={formatConsistency(stats.consistency)}
						color="text-zinc-400"
					/>
				</div>

				<div className="flex gap-8">
					<div className="flex-1 space-y-4">
						<h3 className="text-xl font-bold text-zinc-400">Leaderboard</h3>
						<div className="space-y-2">
							{participants
								.sort((a, b) => (a.rank || 99) - (b.rank || 99))
								.map((p) => (
									<div
										key={p.socketId}
										className="flex justify-between p-3 bg-zinc-800/50 rounded-lg"
									>
										<span>{p.username}</span>
										<span className="font-mono text-emerald-400">
											{formatWPM(p.wpm)} WPM
										</span>
									</div>
								))}
						</div>
					</div>

					<div className="flex-1 space-y-4">
						<h3 className="text-xl font-bold text-zinc-400">Replay</h3>
						{showReplay ? (
							<ReplayVisualizer
								targetText={targetText}
								replayData={stats.replayData}
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
				</div>

				<div className="flex justify-center gap-4 pt-4">
					<button
						onClick={onClose}
						className="px-12 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-colors"
					>
						Return to Lobby
					</button>
					{isHost && onRestart && (
						<button
							onClick={onRestart}
							className="px-12 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-green-900/20"
						>
							Play Again
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

function StatBox({
	label,
	value,
	color,
}: {
	label: string;
	value: string | number;
	color: string;
}) {
	return (
		<div className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-800 text-center">
			<div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
				{label}
			</div>
			<div className={`text-4xl font-black ${color}`}>{value}</div>
		</div>
	);
}
