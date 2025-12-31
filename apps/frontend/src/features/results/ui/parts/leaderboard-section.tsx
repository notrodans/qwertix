import { useMemo } from 'react';
import type { Participant } from '@/entities/room';
import { formatWPM } from '../../domain/format';

interface LeaderboardSectionProps {
	participants: Participant[];
}

export function LeaderboardSection({ participants }: LeaderboardSectionProps) {
	const sorted = useMemo(
		() => [...participants].sort((a, b) => (a.rank || 99) - (b.rank || 99)),
		[participants],
	);

	return (
		<div className="flex-1 space-y-4">
			<h3 className="text-xl font-bold text-zinc-400">Leaderboard</h3>
			<div className="space-y-2">
				{sorted.map((p) => (
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
	);
}
