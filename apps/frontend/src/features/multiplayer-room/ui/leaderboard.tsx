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
		<div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
			<div className="bg-card p-8 rounded-xl max-w-lg w-full border border-border">
				<h2 className="text-3xl font-bold mb-6 text-center text-primary">
					Race Results
				</h2>
				<div className="space-y-3 mb-8">
					{sorted.map((p, idx) => (
						<div
							key={p.socketId}
							className="flex justify-between items-center bg-muted/50 p-4 rounded text-lg"
						>
							<div className="flex items-center gap-4">
								<span
									className={`font-bold w-8 ${idx === 0 ? 'text-primary' : 'text-muted-foreground'}`}
								>
									#{p.rank || '-'}
								</span>
								<span>{p.username}</span>
							</div>
							<div className="font-mono text-primary">
								{Math.round(p.wpm)} WPM
							</div>
						</div>
					))}
				</div>
				<button
					onClick={onClose}
					className="w-full bg-secondary hover:bg-secondary/80 py-3 rounded text-secondary-foreground font-semibold"
				>
					Close
				</button>
			</div>
		</div>
	);
}
