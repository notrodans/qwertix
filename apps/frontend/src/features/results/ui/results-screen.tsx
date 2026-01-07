import type { ComponentType } from 'react';
import type { Participant } from '@/entities/room';
import { LeaderboardSection } from './parts/leaderboard-section';
import { ReplaySection } from './parts/replay-section';
import { StatsGrid } from './parts/stats-grid';

interface ResultsScreenProps {
	stats: {
		wpm: number;
		raw: number;
		accuracy: number;
		consistency: number;
		replayData: { key: string; timestamp: number }[];
		afkDuration?: number;
	};
	targetText: string;
	participants: Participant[];
	isHost?: boolean;
	onRestart?: () => void;
	onClose: () => void;
	ReplayComponent: ComponentType<{
		replay: {
			data: { key: string; timestamp: number }[];
			targetText: string;
		};
	}>;
}

export function ResultsScreen({
	stats,
	targetText,
	participants,
	isHost,
	onRestart,
	onClose,
	ReplayComponent,
}: ResultsScreenProps) {
	return (
		<div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 overflow-y-auto p-4">
			<div className="bg-zinc-900 w-full max-w-4xl rounded-2xl border border-zinc-800 p-8 space-y-8">
				<StatsGrid stats={stats} />

				<div className="flex gap-8">
					<LeaderboardSection participants={participants} />
					<ReplaySection
						targetText={targetText}
						replayData={stats.replayData}
						ReplayComponent={ReplayComponent}
					/>
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
