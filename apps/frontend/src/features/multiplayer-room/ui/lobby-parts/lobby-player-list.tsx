import type { Participant } from '@/entities/room';
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/shared/ui';

interface LobbyPlayerListProps {
	participants: Participant[];
	isHost: boolean;
	onTransferHost: (targetId: string) => void;
}

export function LobbyPlayerList({
	participants,
	isHost,
	onTransferHost,
}: LobbyPlayerListProps) {
	return (
		<Card className="bg-card border-border">
			<CardHeader>
				<CardTitle>Players ({participants.length})</CardTitle>
			</CardHeader>
			<CardContent>
				<ul className="space-y-2">
					{participants.map((p) => (
						<li
							key={p.socketId}
							className="bg-muted/50 p-3 rounded flex justify-between items-center"
						>
							<div className="flex items-center gap-2">
								<span className="font-bold">{p.username}</span>
								{p.isHost && (
									<Badge variant="secondary" className="text-xs">
										Host
									</Badge>
								)}
							</div>
							{isHost && !p.isHost && (
								<Button
									variant="outline"
									size="sm"
									className="h-7 text-[10px] uppercase tracking-tighter"
									onClick={() => onTransferHost(p.socketId)}
								>
									Make Host
								</Button>
							)}
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}
