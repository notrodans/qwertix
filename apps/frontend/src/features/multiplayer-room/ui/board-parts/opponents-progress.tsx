import type { Participant } from '@/entities/room';
import { Progress } from '@/shared/ui';

interface OpponentsProgressProps {
	participants: Participant[];
	currentUser: Participant | undefined;
}

export function OpponentsProgress({
	participants,
	currentUser,
}: OpponentsProgressProps) {
	const others = participants.filter(
		(p) => p.socketId !== currentUser?.socketId,
	);

	return (
		<div className="space-y-4 bg-muted/50 p-4 rounded-lg border border-border">
			{others.map((p) => (
				<div key={p.socketId} className="flex items-center gap-4 text-sm">
					<span className="w-20 truncate text-right font-bold text-muted-foreground">
						{p.username}
					</span>
					<Progress value={p.progress} className="flex-1 h-2" />
					<div className="flex gap-4 font-mono w-32 justify-end">
						<span className="text-muted-foreground">
							{Math.round(p.accuracy)}%
						</span>
						<span className="text-primary w-12 text-right font-bold">
							{Math.round(p.wpm)}
						</span>
					</div>
				</div>
			))}
		</div>
	);
}
