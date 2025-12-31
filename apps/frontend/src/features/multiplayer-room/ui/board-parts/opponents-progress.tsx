import type { Participant } from '@/entities/room';

interface OpponentsProgressProps {
	participants: Participant[];
	currentUser: Participant | undefined;
}

export function OpponentsProgress({
	participants,
	currentUser,
}: OpponentsProgressProps) {
	const others = participants.filter((p) => p.socketId !== currentUser?.socketId);

	return (
		<div className="space-y-2 bg-gray-900/50 p-4 rounded-lg">
			{others.map((p) => (
				<div key={p.socketId} className="flex items-center gap-4 text-sm">
					<span className="w-20 truncate text-right">{p.username}</span>
					<div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
						<div
							className="h-full bg-red-500 transition-all duration-300"
							style={{ width: `${p.progress}%` }}
						/>
					</div>
					<div className="flex gap-4 font-mono w-32 justify-end">
						<span className="text-zinc-400">{Math.round(p.accuracy)}%</span>
						<span className="text-yellow-500 w-12 text-right">
							{Math.round(p.wpm)}
						</span>
					</div>
				</div>
			))}
		</div>
	);
}
