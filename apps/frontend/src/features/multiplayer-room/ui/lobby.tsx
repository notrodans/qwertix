import type { Participant, RoomConfig, RoomStatus } from '@/entities/room';
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
		<div className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto py-8">
			<LobbyHeader roomId={roomId} isHost={isHost} />

			<div className="grid md:grid-cols-2 gap-6 w-full">
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
