import { RoomStatusEnum } from '@qwertix/room-contracts';
import { reatomComponent } from '@reatom/react';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { type Participant } from '@/entities/room';
import { tokenAtom, userAtom } from '@/entities/session';
import {
	cursorIndexAtom,
	setCaretPos,
	typingListenerAtom,
	useCursorPositioning,
} from '@/entities/typing-text';
import { createMultiplayerModel } from '../model/multiplayer-factory';
import { useMultiplayerGame } from '../model/use-multiplayer-game';
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

export const MultiplayerRoomMediator = reatomComponent(
	({ roomId, renderResults }: MultiplayerRoomMediatorProps) => {
		const user = userAtom();
		const token = tokenAtom();

		const [username] = useState(() => {
			if (user?.username) return user.username;
			return `Guest-${Math.floor(Math.random() * 1000)}`;
		});

		// Create local model instance
		const model = useMemo(
			() => createMultiplayerModel(roomId, username, token),
			[roomId, username, token],
		);

		// Activate connection (will be disposed when model changes or component unmounts)
		model.connectionAtom();

		const room = model.roomAtom();
		const error = model.roomErrorAtom();
		const currentUser = room?.participants.find(
			(p: Participant) => p.username === username,
		);

		const game = useMultiplayerGame(model);

		// Cursor positioning
		const containerRef = useRef<HTMLDivElement>(null);
		const cursorIndex = cursorIndexAtom();
		const updateCursor = useCursorPositioning(containerRef, setCaretPos);

		// Keydown listener
		typingListenerAtom();

		useEffect(() => {
			requestAnimationFrame(() => updateCursor(cursorIndex));
		}, [cursorIndex, updateCursor]);

		const localResult = game.localResult;

		// Final Stats Logic (memoized)
		const finalStats = useMemo(() => {
			if (!localResult) return null;
			if (!currentUser) return localResult;

			return {
				...localResult,
				wpm: currentUser.wpm > 0 ? currentUser.wpm : localResult.wpm,
				accuracy:
					currentUser.accuracy > 0
						? currentUser.accuracy
						: localResult.accuracy,
			};
		}, [localResult, currentUser]);

		if (error) {
			return (
				<RoomLayout
					error={<div className="text-destructive">Error: {error}</div>}
				/>
			);
		}

		if (!room) {
			return <RoomLayout loading={<div>Loading Room...</div>} />;
		}

		const isResultsView = !!finalStats;

		return (
			<div className="relative w-full max-w-7xl mx-auto min-h-screen grid grid-cols-1 grid-rows-1">
				{/* Results View Layer */}
				<div
					className={`col-start-1 row-start-1 transition-opacity duration-500 ease-in-out ${
						isResultsView
							? 'opacity-100 z-10 pointer-events-auto'
							: 'opacity-0 z-0 pointer-events-none'
					}`}
				>
					{isResultsView && renderResults
						? renderResults({
								stats: finalStats,
								text: room.text.join(' '),
								participants: room.participants,
								isHost: currentUser?.isHost ?? false,
								onRestart: model.restartGame,
								onClose: game.clearLocalResult,
							})
						: null}
				</div>

				{/* Game View Layer */}
				<div
					className={`col-start-1 row-start-1 flex flex-col gap-8 w-full transition-opacity duration-500 ease-in-out ${
						!isResultsView
							? 'opacity-100 z-10 pointer-events-auto'
							: 'opacity-0 z-0 pointer-events-none'
					}`}
				>
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
									onStart={model.startRace}
									onRestart={model.restartGame}
									onTransferHost={model.transferHost}
									onUpdateSettings={model.updateSettings}
								/>
							) : null
						}
						board={
							(room.status === RoomStatusEnum.COUNTDOWN ||
								room.status === RoomStatusEnum.RACING) &&
							!finalStats ? (
								<div className="relative w-full flex justify-center">
									{!game.isFocused && room.status === RoomStatusEnum.RACING && (
										<div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm cursor-pointer">
											<div className="text-xl font-bold text-foreground flex flex-col items-center gap-2">
												<span>Out of focus</span>
												<span className="text-sm font-normal text-muted-foreground">
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
										containerRef={containerRef}
									/>
								</div>
							) : null
						}
					/>
				</div>
			</div>
		);
	},
);
