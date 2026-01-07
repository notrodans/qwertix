import { RaceModeEnum, RoomStatusEnum } from '@qwertix/room-contracts';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { type Participant } from '@/entities/room';
import { useSessionStore } from '@/entities/session';
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
	afkDuration: number;
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
	const { user, token } = useSessionStore();

	const [username] = useState(() => {
		if (user?.username) return user.username;
		return `Guest-${Math.floor(Math.random() * 1000)}`;
	});

	const [localResult, setLocalResult] = useState<LocalResult | null>(null);

	const handleSubmitResult = (stats: LocalResult & { fullText: string }) => {
		submitResult(stats);
		setLocalResult(stats);
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
	} = useMultiplayerRoom(roomId, username, token);

	// Initialize game hook second, passing state and methods from useMultiplayerRoom
	const game = useMultiplayerGame({
		text: room?.text.join(' ') || '',
		config: room?.config || { mode: RaceModeEnum.WORDS, wordCount: 0 },
		status: room?.status ?? RoomStatusEnum.LOBBY,
		startTime: room?.startTime,
		onProgress: updateProgress,
		onLoadMore: loadMoreWords,
		onSubmit: handleSubmitResult,
	});

	// Merge local result with server-side calculated stats for display
	const finalStats = useMemo(() => {
		if (!localResult) return null;
		if (!currentUser) return localResult;

		return {
			...localResult,
			wpm: currentUser.wpm > 0 ? currentUser.wpm : localResult.wpm,
			accuracy:
				currentUser.accuracy > 0 ? currentUser.accuracy : localResult.accuracy,
		};
	}, [localResult, currentUser]);

	// Clean up local result when returning to lobby
	useEffect(() => {
		if (room?.status === RoomStatusEnum.LOBBY) {
			setLocalResult(null);
		}
	}, [room?.status]);

	if (error) {
		return (
			<RoomLayout error={<div className="text-red-400">Error: {error}</div>} />
		);
	}

	if (!room) {
		return <RoomLayout loading={<div>Loading Room...</div>} />;
	}

	return (
		<RoomLayout
			lobby={
				room.status === RoomStatusEnum.LOBBY ||
				(room.status === RoomStatusEnum.FINISHED && !localResult) ? (
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
				(room.status === RoomStatusEnum.COUNTDOWN ||
					room.status === RoomStatusEnum.RACING) &&
				!finalStats ? (
					<div className="relative w-full">
						{!game.isFocused && room.status === RoomStatusEnum.RACING && (
							<div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg cursor-pointer">
								<div className="text-xl font-bold text-white flex flex-col items-center gap-2">
									<span>Out of focus</span>
									<span className="text-sm font-normal text-zinc-300">
										Click to resume
									</span>
								</div>
							</div>
						)}
						<MultiplayerBoard
							text={room.text.join(' ')}
							config={room.config}
							status={room.status}
							startTime={room.startTime}
							participants={room.participants}
							currentUser={currentUser}
							// Game State
							userTyped={game.userTyped}
							validLength={game.validLength}
							caretPos={game.caretPos}
							timeLeft={game.timeLeft}
							containerRef={game.containerRef}
						/>
					</div>
				) : null
			}
			results={
				finalStats
					? renderResults?.({
							stats: finalStats,
							text: room.text.join(' '),
							participants: room.participants,
							isHost: currentUser?.isHost ?? false,
							onRestart: restartGame,
							onClose: () => setLocalResult(null),
						})
					: null
			}
		/>
	);
}
