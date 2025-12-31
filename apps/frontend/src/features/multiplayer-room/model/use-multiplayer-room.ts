import { useQuery } from '@tanstack/react-query';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { type Room, type RoomConfig, roomQueries } from '@/entities/room';
import { socketService } from '@/shared/api/socket';
import { connectToRoom } from '../api/room-socket';

export function useMultiplayerRoom(
	roomId: string,
	username: string,
	options?: {
		onWordsAppended?: (words: string[]) => void;
		onHostPromoted?: (message: string) => void;
		onRaceStart?: () => void;
		onRaceFinished?: () => void;
		onResultSaved?: (payload: { success: boolean }) => void;
	},
) {
	const [room, setRoom] = useState<Room | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Initial fetch via HTTP to check room existence and get initial state
	const { isError } = useQuery({
		...roomQueries.get(roomId),
		enabled: !!roomId,
	});

	// Stable reference for options to prevent reconnects on every render if parent creates new object
	const optionsRef = useRef(options);
	useLayoutEffect(() => {
		optionsRef.current = options;
	}, [options]);

	useEffect(() => {
		if (!roomId) return;

		const cleanup = connectToRoom(roomId, username, {
			onRoomState: (payload) => setRoom(payload),
			onPlayerJoined: (payload) => {
				setRoom((prev) => {
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
				setRoom((prev) => {
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
				setRoom((prev) =>
					prev
						? { ...prev, status: 'COUNTDOWN', startTime: payload.startTime }
						: null,
				);
			},
			onRaceStart: () => {
				setRoom((prev) => (prev ? { ...prev, status: 'RACING' } : null));
				optionsRef.current?.onRaceStart?.();
			},
			onProgressUpdate: (payload) => {
				setRoom((prev) => {
					if (!prev) return null;
					return { ...prev, participants: payload };
				});
			},
			onRaceFinished: (payload) => {
				setRoom((prev) => {
					if (!prev) return null;
					return {
						...prev,
						status: 'FINISHED',
						participants: payload.leaderboard,
					};
				});
				optionsRef.current?.onRaceFinished?.();
			},
			onWordsAppended: (payload) => {
				setRoom((prev) => {
					if (!prev) return null;
					return {
						...prev,
						text: [...prev.text, ...payload.words],
					};
				});
				optionsRef.current?.onWordsAppended?.(payload.words);
			},
			onHostPromoted: (payload) => {
				optionsRef.current?.onHostPromoted?.(payload.message);
			},
			onError: (payload) => {
				setError(payload.message);
			},
			onResultSaved: (payload) => {
				optionsRef.current?.onResultSaved?.(payload);
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
		error: isError ? 'Room not found or connection faild' : error,
		startRace,
		updateProgress,
		updateSettings,
		transferHost,
		loadMoreWords,
		submitResult,
		restartGame,
		currentUser: room?.participants.find((p) => p.username === username),
	};
}
