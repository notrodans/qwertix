import { type RoomStatus, RoomStatusEnum } from '@/entities/room';
import { Button } from '@/shared/ui';

interface LobbyActionsProps {
	isHost: boolean;
	status: RoomStatus;
	onStart: () => void;
	onRestart: () => void;
}

export function LobbyActions({
	isHost,
	status,
	onStart,
	onRestart,
}: LobbyActionsProps) {
	if (!isHost) {
		return (
			<div className="text-muted-foreground font-bold italic animate-pulse">
				{status === RoomStatusEnum.FINISHED
					? 'Waiting for host to restart...'
					: 'Waiting for host to start...'}
			</div>
		);
	}

	return (
		<Button
			onClick={status === RoomStatusEnum.FINISHED ? onRestart : onStart}
			className="px-12 py-8 rounded-xl text-2xl font-black bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
		>
			{status === RoomStatusEnum.FINISHED ? 'RESTART GAME' : 'START RACE'}
		</Button>
	);
}
