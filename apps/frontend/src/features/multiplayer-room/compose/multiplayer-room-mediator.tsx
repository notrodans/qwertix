import { useState } from 'react';
import { type Participant } from '@/entities/room';
import { useMultiplayerRoom } from '../model/use-multiplayer-room';
import { Lobby } from '../ui/lobby';
import { MultiplayerBoard } from '../ui/multiplayer-board';
import { RoomLayout } from '../ui/room-layout';

export interface LocalResult {
	wpm: number;
	raw: number;
	accuracy: number;
	consistency: number;
	replayData: { key: string; timestamp: number }[];
}

interface MultiplayerRoomMediatorProps {
	roomId: string;
	onFinish?: (
		stats: LocalResult,
		text: string,
		participants: Participant[],
	) => void;
}

export function MultiplayerRoomMediator({
	roomId,
	onFinish,
}: MultiplayerRoomMediatorProps) {
	// Temporary username generation until auth is ready
	const [username] = useState(
		() => `Guest-${Math.floor(Math.random() * 1000)}`,
	);

	const {
		room,
		error,
		startRace,
		updateProgress,
		updateSettings,
		transferHost,
		currentUser,
		loadMoreWords,
		submitResult,
	} = useMultiplayerRoom(roomId, username, {
		onHostPromoted: (message) => {
			alert(message);
		},
	});

	if (error) {
		return (
			<RoomLayout error={<div className="text-red-400">Error: {error}</div>} />
		);
	}

	if (!room) {
		return <RoomLayout loading={<div>Loading Room...</div>} />;
	}

	const handleSubmitResult = (stats: LocalResult) => {
		submitResult(stats);
		onFinish?.(stats, room.text.join(' '), room.participants);
	};

	return (
		<RoomLayout
			lobby={
				room.status === 'LOBBY' ? (
					<Lobby
						roomId={roomId}
						participants={room.participants}
						config={room.config}
						isHost={currentUser?.isHost ?? false}
						onStart={startRace}
						onTransferHost={transferHost}
						onUpdateSettings={updateSettings}
					/>
				) : null
			}
			board={
				room.status === 'COUNTDOWN' ||
				room.status === 'RACING' ||
				room.status === 'FINISHED' ? (
					<MultiplayerBoard
						text={room.text.join(' ')}
						config={room.config}
						onProgress={updateProgress}
						onLoadMore={loadMoreWords}
						onSubmit={handleSubmitResult}
						status={room.status}
						participants={room.participants}
						currentUser={currentUser}
					/>
				) : null
			}
		/>
	);
}
