import { RaceModeEnum } from '@qwertix/room-contracts';
import { type ReactNode, useState } from 'react';
import { type Participant } from '@/entities/room';
import { useMultiplayerGame } from '../model/use-multiplayer-game';
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
	renderResults?: (props: {
		stats: LocalResult;
		text: string;
		participants: Participant[];
		isHost: boolean;
		onRestart: () => void;
		onClose: () => void;
	}) => ReactNode;
}

export function MultiplayerRoomMediator({
	roomId,
	renderResults,
}: MultiplayerRoomMediatorProps) {
	const [username] = useState(
		() => `Guest-${Math.floor(Math.random() * 1000)}`,
	);
	const [localStats, setLocalStats] = useState<
		(LocalResult & { fullText: string }) | null
	>(null);

	// Game Logic Hook - lifted up to Mediator
	// We need 'room' to initialize game, but 'useMultiplayerRoom' needs callbacks from 'game'.
	// This cyclic dependency is solved by using stable callbacks from 'useMultiplayerGame' or refs.
	// Since 'useMultiplayerGame' needs 'text' and 'config' which come from 'room',
	// we have to be careful.
	// Actually, we can use 'useMultiplayerRoom' first, get the room, and THEN use 'useMultiplayerGame'.
	// But 'useMultiplayerRoom' needs callbacks that CALL 'useMultiplayerGame' methods.
	// We can use a ref for the game methods or just state?
	// Or we can define the game hook AFTER, and pass its methods to useMultiplayerRoom via a ref that gets updated?
	// No, hooks order must be static.

	// Better approach: 'useMultiplayerRoom' returns 'room'.
	// We use 'useMultiplayerGame' with that room.
	// We pass a ref to 'useMultiplayerRoom' that we populate with game methods?
	// Or we use a simpler approach:
	// The callbacks in 'useMultiplayerRoom' options can just set a flag or trigger an event?
	// No, we want imperative control.

	// Let's use a mutable ref object to link them.
	const gameControlsRef = {
		startTimer: () => {
			// Placeholder, populated later
		},
		forceFinish: () => {
			// Placeholder, populated later
		},
	};

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
		restartGame,
	} = useMultiplayerRoom(roomId, username, {
		onHostPromoted: (message) => {
			alert(message);
		},
		onRaceStart: () => {
			gameControlsRef.startTimer();
		},
		onRaceFinished: () => {
			gameControlsRef.forceFinish();
		},
	});

	const handleSubmitResult = (stats: LocalResult & { fullText: string }) => {
		submitResult(stats);
		setLocalStats(stats);
	};

	// Initialize game hook only if room exists (or pass defaults)
	const game = useMultiplayerGame({
		text: room?.text.join(' ') || '',
		config: room?.config || { mode: RaceModeEnum.WORDS, wordCount: 0 },
		onProgress: updateProgress,
		onLoadMore: loadMoreWords,
		onSubmit: handleSubmitResult,
	});

	// Link game methods to the ref so 'useMultiplayerRoom' callbacks can call them
	gameControlsRef.startTimer = game.startTimer;
	gameControlsRef.forceFinish = game.forceFinish;

	if (error) {
		return (
			<RoomLayout error={<div className="text-red-400">Error: {error}</div>} />
		);
	}

	if (!room) {
		return <RoomLayout loading={<div>Loading Room...</div>} />;
	}

	// Reset local stats if room goes back to LOBBY or COUNTDOWN
	if ((room.status === 'LOBBY' || room.status === 'COUNTDOWN') && localStats) {
		setLocalStats(null);
	}

	return (
		<>
			<RoomLayout
				lobby={
					room.status === 'LOBBY' ||
					(room.status === 'FINISHED' && !localStats) ? (
						<Lobby
							roomId={roomId}
							participants={room.participants}
							config={room.config}
							isHost={currentUser?.isHost ?? false}
							status={room.status}
							onStart={startRace}
							onRestart={restartGame}
							onTransferHost={transferHost}
							onUpdateSettings={updateSettings}
						/>
					) : null
				}
				board={
					room.status === 'COUNTDOWN' ||
					room.status === 'RACING' ||
					(room.status === 'FINISHED' && localStats) ? (
						<MultiplayerBoard
							text={room.text.join(' ')}
							config={room.config}
							status={room.status}
							startTime={room.startTime}
							participants={room.participants}
							currentUser={currentUser}
							// Game State
							userTyped={game.userTyped}
							caretPos={game.caretPos}
							timeLeft={game.timeLeft}
							containerRef={game.containerRef}
						/>
					) : null
				}
			/>
			{localStats &&
				renderResults?.({
					stats: localStats,
					text: localStats.fullText,
					participants: room.participants,
					isHost: currentUser?.isHost ?? false,
					onRestart: restartGame,
					onClose: () => setLocalStats(null),
				})}
		</>
	);
}
