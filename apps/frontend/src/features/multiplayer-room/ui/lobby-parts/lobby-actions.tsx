import { type RoomStatus, RoomStatusEnum } from '@/entities/room';

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
			<div className="text-gray-500 font-bold italic animate-pulse">
				{status === RoomStatusEnum.FINISHED
					? 'Waiting for host to restart...'
					: 'Waiting for host to start...'}
			</div>
		);
	}

	return (
		<button
			type="button"
			onClick={status === RoomStatusEnum.FINISHED ? onRestart : onStart}
			className="bg-green-600 hover:bg-green-500 px-12 py-4 rounded-xl text-2xl font-black text-white shadow-lg shadow-green-900/20 transition-all hover:scale-105 active:scale-95"
		>
			{status === RoomStatusEnum.FINISHED ? 'RESTART GAME' : 'START RACE'}
		</button>
	);
}
