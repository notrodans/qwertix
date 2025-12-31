import type { RoomStatus } from '@qwertix/room-contracts';
import type { Participant, RoomConfig } from '@/entities/room';
import { LobbyActions } from './lobby-parts/lobby-actions';
import { LobbyHeader } from './lobby-parts/lobby-header';
import { LobbyInvite } from './lobby-parts/lobby-invite';
import { LobbyPlayerList } from './lobby-parts/lobby-player-list';
import { LobbySettings } from './lobby-parts/lobby-settings';

interface LobbyProps {
	roomId: string;
	participants: Participant[];
	isHost: boolean;
	config: RoomConfig;
	status: RoomStatus;
	onStart: () => void;
	onRestart: () => void;
	onTransferHost: (targetId: string) => void;
	onUpdateSettings: (config: RoomConfig) => void;
}

export function Lobby({
	roomId,
	participants,
	isHost,
	config,
	status,
	onStart,
	onRestart,
	onTransferHost,
	onUpdateSettings,
}: LobbyProps) {
	const shareUrl = `${window.location.origin}/room/${roomId}`;

	return (
		<div className="flex flex-col items-center justify-center p-8 space-y-6 w-full max-w-2xl mx-auto">
			<LobbyHeader roomId={roomId} isHost={isHost} />

			<div className="grid grid-cols-2 gap-8 w-full">
				<div className="space-y-6">
					<LobbyInvite shareUrl={shareUrl} />
					<LobbySettings
						config={config}
						isHost={isHost}
						onUpdateSettings={onUpdateSettings}
					/>
				</div>

				<LobbyPlayerList
					participants={participants}
					isHost={isHost}
					onTransferHost={onTransferHost}
				/>
			</div>

			<LobbyActions
				isHost={isHost}
				status={status}
				onStart={onStart}
				onRestart={onRestart}
			/>
		</div>
	);
}
