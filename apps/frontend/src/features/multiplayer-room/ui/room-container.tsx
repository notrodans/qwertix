import { useState } from 'react';
import { type Participant } from '@/entities/room';
import { useMultiplayerRoom } from '../model/use-multiplayer-room';
import { Lobby } from './lobby';
import { MultiplayerBoard } from './multiplayer-board';

export interface LocalResult {
	wpm: number;
	raw: number;
	accuracy: number;
	consistency: number;
	replayData: { key: string; timestamp: number }[];
}

interface RoomContainerProps {
	roomId: string;
	onFinish?: (
		stats: LocalResult,
		text: string,
		participants: Participant[],
	) => void;
}

export function RoomContainer({ roomId, onFinish }: RoomContainerProps) {
	// Temporary username generation until auth is ready
	const [username] = useState(
		() => `Guest-${Math.floor(Math.random() * 1000)}`,
	);

	const {
		room,
		error,
		startRace,
		updateProgress,
		currentUser,
		loadMoreWords,
		submitResult,
	} = useMultiplayerRoom(roomId, username);

	const handleSubmitResult = (stats: LocalResult) => {
		submitResult(stats);
		if (room) {
			onFinish?.(stats, room.text.join(' '), room.participants);
		}
	};

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-[50vh] text-red-400">
				Error: {error}
			</div>
		);
	}

	if (!room) {
		return (
			<div className="flex items-center justify-center min-h-[50vh]">
				Loading Room...
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			{room.status === 'LOBBY' && (
				<Lobby
					roomId={roomId}
					participants={room.participants}
					isHost={currentUser?.isHost ?? false}
					onStart={startRace}
				/>
			)}

			{(room.status === 'COUNTDOWN' ||
				room.status === 'RACING' ||
				room.status === 'FINISHED') && (
				<>
					<MultiplayerBoard
						text={room.text.join(' ')}
						onProgress={updateProgress}
						onLoadMore={loadMoreWords}
						onSubmit={handleSubmitResult}
						status={room.status}
						participants={room.participants}
						currentUser={currentUser}
					/>
				</>
			)}
		</div>
	);
}
