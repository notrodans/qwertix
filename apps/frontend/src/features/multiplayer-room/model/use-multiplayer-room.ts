import { env } from '@env';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { type Participant, type Room, roomQueries } from '@/entities/room';
import { socketService } from '@/shared/api/socket';

export function useMultiplayerRoom(roomId: string, username: string) {
	const [room, setRoom] = useState<Room | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Initial fetch via HTTP to check room existence and get initial state
	const { isError } = useQuery({
		...roomQueries.get(roomId),
		enabled: !!roomId,
	});

	useEffect(() => {
		if (isError) {
			setError('Room not found or connection failed');
		}
	}, [isError]);

	useEffect(() => {
		if (!roomId) return;

		// Connect WS
		socketService.connect(env.VITE_WS_URL);

		const handleRoomState = (payload: Room) => {
			setRoom(payload);
		};

		const handlePlayerJoined = (payload: Participant) => {
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
		};

		const handlePlayerLeft = (payload: { userId: string }) => {
			setRoom((prev) => {
				if (!prev) return null;
				return {
					...prev,
					participants: prev.participants.filter(
						(p) => p.socketId !== payload.userId,
					),
				};
			});
		};

		const handleCountdown = (_payload: { startTime: number }) => {
			setRoom((prev) => (prev ? { ...prev, status: 'COUNTDOWN' } : null));
			// Could also store startTime to show countdown timer
		};

		const handleRaceStart = () => {
			setRoom((prev) => (prev ? { ...prev, status: 'RACING' } : null));
		};

		const handleProgressUpdate = (payload: Participant[]) => {
			setRoom((prev) => {
				if (!prev) return null;
				return { ...prev, participants: payload };
			});
		};

		const handleRaceFinished = (payload: { leaderboard: Participant[] }) => {
			setRoom((prev) => {
				if (!prev) return null;
				return {
					...prev,
					status: 'FINISHED',
					participants: payload.leaderboard,
				};
			});
		};

		const handleWordsAppended = (payload: { words: string[] }) => {
			setRoom((prev) => {
				if (!prev) return null;
				return {
					...prev,
					text: [...prev.text, ...payload.words],
				};
			});
		};

		const handleError = (payload: { message: string }) => {
			setError(payload.message);
		};

		// Listeners
		const unsubs = [
			socketService.on('ROOM_STATE', handleRoomState),
			socketService.on('PLAYER_JOINED', handlePlayerJoined),
			socketService.on('PLAYER_LEFT', handlePlayerLeft),
			socketService.on('COUNTDOWN_START', handleCountdown),
			socketService.on('RACE_START', handleRaceStart),
			socketService.on('PROGRESS_UPDATE', handleProgressUpdate),
			socketService.on('RACE_FINISHED', handleRaceFinished),
			socketService.on('WORDS_APPENDED', handleWordsAppended),
			socketService.on('ERROR', handleError),
		];

		// Join Room once connected
		const joinRoom = () => {
			socketService.send('JOIN_ROOM', { roomId, username });
		};

		if (socketService.connected()) {
			joinRoom();
		} else {
			unsubs.push(socketService.on('CONNECTED', joinRoom));
		}

		return () => {
			socketService.disconnect();
			for (const unsub of unsubs) unsub();
		};
	}, [roomId, username]);

	const startRace = () => {
		socketService.send('START_RACE', {});
	};

	const updateProgress = (progress: number, wpm: number) => {
		socketService.send('UPDATE_PROGRESS', { progress, wpm });
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

	return {
		room,
		error,
		startRace,
		updateProgress,
		loadMoreWords,
		submitResult,
		currentUser: room?.participants.find((p) => p.username === username),
	};
}
