import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
	type Participant,
	type Room,
	type RoomConfig,
	RoomStatusEnum,
	roomQueries,
} from '@/entities/room';
import { socketService } from '@/shared/api/socket';
import { connectToRoom } from '../api/room-socket';

export function useMultiplayerRoom(roomId: string, username: string) {
	const [room, setRoom] = useState<Room | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isResultSaved, setIsResultSaved] = useState(false);

	// Initial fetch via HTTP to check room existence and get initial state
	const { isError } = useQuery({
		...roomQueries.get(roomId),
		enabled: !!roomId,
	});

	useEffect(() => {
		if (!roomId) return;

		const cleanup = connectToRoom(roomId, username, {
			onRoomState: (payload) => {
				setRoom(payload);
				setIsResultSaved(false);
			},
			onPlayerJoined: (payload) => {
				setRoom((prev: Room | null) => {
					if (!prev) return null;
					const exists = prev.participants.find(
						(p) => p.socketId === payload.socketId,
					);
					if (exists) return prev;
					return {
						...prev,
						participants: [...prev.participants, payload],
					};
				});
			},
			onPlayerLeft: (payload) => {
				setRoom((prev: Room | null) => {
					if (!prev) return null;
					return {
						...prev,
						participants: prev.participants.filter(
							(p) => p.socketId !== payload.userId,
						),
					};
				});
			},
			onCountdown: (payload) => {
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
			onProgressUpdate: (payload) => {
				setRoom((prev: Room | null) => {
					if (!prev) return null;
					return { ...prev, participants: payload };
				});
			},
			onRaceFinished: (payload) => {
				setRoom((prev: Room | null) => {
					if (!prev) return null;
					return {
						...prev,
						status: RoomStatusEnum.FINISHED,
						participants: payload.leaderboard,
					};
				});
			},
			onWordsAppended: (payload) => {
				setRoom((prev: Room | null) => {
					if (!prev) return null;
					return {
						...prev,
						text: [...prev.text, ...payload.words],
					};
				});
			},
			onHostPromoted: (payload) => {
				alert(payload.message);
			},
			onError: (payload) => {
				setError(payload.message);
			},
			onResultSaved: (payload) => {
				if (payload.success) {
					setIsResultSaved(true);
				}
			},
		});

		return cleanup;
	}, [roomId, username]);

	const startRace = () => {
		socketService.send('START_RACE', {});
	};

	const updateProgress = (typedLength: number) => {
		socketService.send('UPDATE_PROGRESS', { typedLength });
	};

	const updateSettings = (config: RoomConfig) => {
		socketService.send('UPDATE_SETTINGS', config);
	};

	const transferHost = (targetId: string) => {
		socketService.send('TRANSFER_HOST', { targetId });
	};

	const loadMoreWords = () => {
		socketService.send('LOAD_MORE_WORDS', {});
	};

	const submitResult = (stats: {
		wpm: number;
		raw: number;
		accuracy: number;
		consistency: number;
		replayData: { key: string; timestamp: number }[];
	}) => {
		socketService.send('SUBMIT_RESULT', stats);
	};

	const restartGame = () => {
		socketService.send('RESTART_GAME', {});
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
			(p: Participant) => p.username === username,
		),
	};
}
