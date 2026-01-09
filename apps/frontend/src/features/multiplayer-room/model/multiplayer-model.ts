import { env } from '@env';
import {
	calculateResultHash,
	type ParticipantDTO,
	type RoomConfig,
	type RoomDTO,
	SocketActionEnum,
} from '@qwertix/room-contracts';
import { action, atom, wrap } from '@reatom/core';
import { type Room, RoomStatusEnum } from '@/entities/room';
import { socketService } from '@/shared/api/socket';
import { connectToRoom } from '../api/room-socket';

export const roomAtom = atom<Room | null>(null, 'multiplayer.room');
export const roomErrorAtom = atom<string | null>(null, 'multiplayer.error');
export const isResultSavedAtom = atom(false, 'multiplayer.isResultSaved');

let disconnectFn: (() => void) | null = null;

export const joinRoom = action(
	(roomId: string, username: string, token: string | null = null) => {
		// Cleanup previous connection
		if (disconnectFn) {
			disconnectFn();
			disconnectFn = null;
		}

		roomErrorAtom.set(null);
		isResultSavedAtom.set(false);

		disconnectFn = connectToRoom(roomId, username, token, {
			onRoomState: (payload: RoomDTO) => {
				roomAtom.set(payload);
				isResultSavedAtom.set(false);
			},
			onPlayerJoined: (payload: ParticipantDTO) => {
				const prev = roomAtom();
				if (!prev) return;
				if (prev.participants.some((p) => p.socketId === payload.socketId))
					return;
				roomAtom.set({
					...prev,
					participants: [...prev.participants, payload],
				});
			},
			onPlayerLeft: (payload: { userId: string }) => {
				const prev = roomAtom();
				if (!prev) return;
				roomAtom.set({
					...prev,
					participants: prev.participants.filter(
						(p) => p.socketId !== payload.userId,
					),
				});
			},
			onCountdown: (payload: { startTime: number }) => {
				const prev = roomAtom();
				if (!prev) return;
				roomAtom.set({
					...prev,
					status: RoomStatusEnum.COUNTDOWN,
					startTime: payload.startTime,
				});
			},
			onRaceStart: () => {
				const prev = roomAtom();
				if (!prev) return;
				roomAtom.set({
					...prev,
					status: RoomStatusEnum.RACING,
				});
			},
			onProgressUpdate: (payload: ParticipantDTO[]) => {
				const prev = roomAtom();
				if (!prev) return;
				roomAtom.set({
					...prev,
					participants: payload,
				});
			},
			onRaceFinished: (payload: { leaderboard: ParticipantDTO[] }) => {
				const prev = roomAtom();
				if (!prev) return;
				roomAtom.set({
					...prev,
					status: RoomStatusEnum.FINISHED,
					participants: payload.leaderboard,
				});
			},
			onWordsAppended: (payload: { words: string[] }) => {
				const prev = roomAtom();
				if (!prev) return;
				roomAtom.set({
					...prev,
					text: [...prev.text, ...payload.words],
				});
			},
			onHostPromoted: () => {
				// notification logic can be added here
			},
			onResultSaved: (payload: { success: boolean }) => {
				if (payload.success) isResultSavedAtom.set(true);
			},
			onError: (payload: { message: string }) => {
				roomErrorAtom.set(payload.message);
			},
		});
	},
	'multiplayer.joinRoom',
);

export const leaveRoom = action(() => {
	if (disconnectFn) {
		disconnectFn();
		disconnectFn = null;
	}
	roomAtom.set(null);
}, 'multiplayer.leaveRoom');

export const startRace = action(() => {
	socketService.send(SocketActionEnum.START_RACE, {});
}, 'multiplayer.startRace');

export const updateProgress = action((typedLength: number) => {
	socketService.send(SocketActionEnum.UPDATE_PROGRESS, { typedLength });
}, 'multiplayer.updateProgress');

export const updateSettings = action((config: RoomConfig) => {
	socketService.send(SocketActionEnum.UPDATE_SETTINGS, config);
}, 'multiplayer.updateSettings');

export const transferHost = action((targetId: string) => {
	socketService.send(SocketActionEnum.TRANSFER_HOST, { targetId });
}, 'multiplayer.transferHost');

export const loadMoreWords = action(() => {
	socketService.send(SocketActionEnum.LOAD_MORE_WORDS, {});
}, 'multiplayer.loadMoreWords');

export const restartGame = action(() => {
	socketService.send(SocketActionEnum.RESTART_GAME, {});
}, 'multiplayer.restartGame');

export const submitResult = action(
	async (stats: {
		wpm: number;
		raw: number;
		accuracy: number;
		consistency: number;
		afkDuration: number;
		replayData: { key: string; timestamp: number }[];
	}) => {
		const room = roomAtom();
		if (!room) return;

		const startTime = room.startTime || Date.now();
		const endTime = Date.now();
		const targetText = room.text.join(' ');

		const hash = await wrap(
			calculateResultHash(
				stats.wpm,
				stats.raw,
				stats.accuracy,
				stats.consistency,
				startTime,
				endTime,
				stats.afkDuration,
				targetText,
				env.VITE_RESULT_HASH_SALT,
			),
		);

		socketService.send(SocketActionEnum.SUBMIT_RESULT, {
			...stats,
			startTime,
			endTime,
			afkDuration: stats.afkDuration,
			hash,
		});
	},
	'multiplayer.submitResult',
);
