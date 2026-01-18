import { Badge } from '@/shared/ui';

interface LobbyHeaderProps {
	roomId: string;
	isHost: boolean;
}

export function LobbyHeader({ roomId, isHost }: LobbyHeaderProps) {
	return (
		<div className="flex flex-col items-center gap-4">
			<h1 className="text-3xl font-bold">Room: {roomId}</h1>
			{isHost && (
				<Badge
					variant="outline"
					className="border-primary/50 text-primary bg-primary/20 px-4 py-1 text-sm animate-pulse"
				>
					You are the Host
				</Badge>
			)}
		</div>
	);
}
