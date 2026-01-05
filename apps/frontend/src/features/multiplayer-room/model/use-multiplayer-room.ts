import { type ParticipantDTO, SocketActionEnum } from '@qwertix/room-contracts';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
	type Room,
	type RoomConfig,
	RoomStatusEnum,
	roomQueries,
} from '@/entities/room';
import { socketService } from '@/shared/api/socket';
import { connectToRoom } from '../api/room-socket';

export function useMultiplayerRoom(
	roomId: string,
	username: string,
	token?: string | null,
) {
	const [room, setRoom] = useState<Room | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isResultSaved, setIsResultSaved] = useState(false);

	// Initial fetch via HTTP to check room existence and get initial state
	const { data: initialRoom, isError } = useQuery({
		...roomQueries.get(roomId),
		enabled: !!roomId,
	});

	// Use initial room data when it arrives
	useEffect(() => {
		if (initialRoom && !room) {
			setRoom(initialRoom);
		}
	}, [initialRoom, room]);

	useEffect(() => {
		if (!roomId) return;

		const cleanup = connectToRoom(
			roomId,
			username,
			{
				onRoomState: (payload) => {
					setRoom(payload);
					setIsResultSaved(false);
				},
				onPlayerJoined: (payload: ParticipantDTO) => {
					setRoom((prev: Room | null) => {
						if (!prev) return null;
						const exists = prev.participants.find(
							(p: ParticipantDTO) => p.socketId === payload.socketId,
						);
						if (exists) return prev;
						return {
							...prev,
							participants: [...prev.participants, payload],
						};
					});
				},
				onPlayerLeft: (payload: { userId: string }) => {
					setRoom((prev: Room | null) => {
						if (!prev) return null;
						return {
							...prev,
							participants: prev.participants.filter(
								(p: ParticipantDTO) => p.socketId !== payload.userId,
							),
						};
					});
				},
				onCountdown: (payload: { startTime: number }) => {
					setRoom((prev: Room | null) =>
						prev
							? {
									...prev,
									status: RoomStatusEnum.COUNTDOWN,
									startTime: payload.startTime,
								}
							: null,
					);
				},
				onRaceStart: () => {
					setRoom((prev: Room | null) =>
						prev ? { ...prev, status: RoomStatusEnum.RACING } : null,
					);
				},
				onProgressUpdate: (payload: ParticipantDTO[]) => {
					setRoom((prev: Room | null) => {
						if (!prev) return null;
						return { ...prev, participants: payload };
					});
				},
				onRaceFinished: (payload: { leaderboard: ParticipantDTO[] }) => {
					setRoom((prev: Room | null) => {
						if (!prev) return null;
						return {
							...prev,
							status: RoomStatusEnum.FINISHED,
							participants: payload.leaderboard,
						};
					});
				},
				onWordsAppended: (payload: { words: string[] }) => {
					setRoom((prev: Room | null) => {
						if (!prev) return null;
						return {
							...prev,
							text: [...prev.text, ...payload.words],
						};
					});
				},
				onHostPromoted: (payload: { message: string }) => {
					alert(payload.message);
				},
				onError: (payload: { message: string }) => {
					setError(payload.message);
				},
				onResultSaved: (payload: { success: boolean }) => {
					if (payload.success) {
						setIsResultSaved(true);
					}
				},
			},
			token,
		);

		return cleanup;
	}, [roomId, username, token]);

	const startRace = () => {
		socketService.send(SocketActionEnum.START_RACE, {});
	};

	const updateProgress = (typedLength: number) => {
		socketService.send(SocketActionEnum.UPDATE_PROGRESS, { typedLength });
	};

	const updateSettings = (config: RoomConfig) => {
		socketService.send(SocketActionEnum.UPDATE_SETTINGS, config);
	};

	const transferHost = (targetId: string) => {
		socketService.send(SocketActionEnum.TRANSFER_HOST, { targetId });
	};

	const loadMoreWords = () => {
		socketService.send(SocketActionEnum.LOAD_MORE_WORDS, {});
	};

	const submitResult = (stats: {
		wpm: number;
		raw: number;
		accuracy: number;
		consistency: number;
		replayData: { key: string; timestamp: number }[];
	}) => {
		socketService.send(SocketActionEnum.SUBMIT_RESULT, stats);
	};

	const restartGame = () => {
		socketService.send(SocketActionEnum.RESTART_GAME, {});
	};

	return {
		room,
		error: isError ? 'Room not found or connection failed' : error,
		isResultSaved,
		startRace,
		updateProgress,
		updateSettings,
		transferHost,
		loadMoreWords,
		submitResult,
		restartGame,
		currentUser: room?.participants.find(
			(p: ParticipantDTO) => p.username === username,
		),
	};
}
