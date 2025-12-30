import type { Participant } from '@/entities/room';

interface LeaderboardProps {
	participants: Participant[];
	onClose: () => void; // Or rematch
}

export function Leaderboard({ participants, onClose }: LeaderboardProps) {
	const sorted = [...participants].sort(
		(a, b) => (a.rank || 999) - (b.rank || 999),
	);

	return (
		<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
			<div className="bg-gray-900 p-8 rounded-xl max-w-lg w-full border border-gray-700">
				<h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">
					Race Results
				</h2>
				<div className="space-y-3 mb-8">
					{sorted.map((p, idx) => (
						<div
							key={p.socketId}
							className="flex justify-between items-center bg-gray-800 p-4 rounded text-lg"
						>
							<div className="flex items-center gap-4">
								<span
									className={`font-bold w-8 ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-orange-400' : 'text-gray-600'}`}
								>
									#{p.rank || '-'}
								</span>
								<span>{p.username}</span>
							</div>
							<div className="font-mono text-yellow-500">
								{Math.round(p.wpm)} WPM
							</div>
						</div>
					))}
				</div>
				<button
					onClick={onClose}
					className="w-full bg-gray-700 hover:bg-gray-600 py-3 rounded text-white font-semibold"
				>
					Close
				</button>
			</div>
		</div>
	);
}
