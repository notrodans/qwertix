import {
	type ParticipantDTO,
	type RoomDTO,
	SocketActionEnum,
	SocketEventEnum,
} from '@qwertix/room-contracts';
import { socketService } from '@/shared/api/socket';

export interface RoomSocketCallbacks {
	onRoomState: (payload: RoomDTO) => void;
	onPlayerJoined: (payload: ParticipantDTO) => void;
	onPlayerLeft: (payload: { userId: string }) => void;
	onCountdown: (payload: { startTime: number }) => void;
	onRaceStart: () => void;
	onProgressUpdate: (payload: ParticipantDTO[]) => void;
	onRaceFinished: (payload: { leaderboard: ParticipantDTO[] }) => void;
	onWordsAppended: (payload: { words: string[] }) => void;
	onHostPromoted: (payload: { message: string }) => void;
	onResultSaved: (payload: {
		success: boolean;
		stats?: { wpm: number; accuracy: number; raw: number };
	}) => void;
}

export function connectToRoom(
	roomId: string,
	username: string,
	callbacks: RoomSocketCallbacks,
) {
	const unsubs = [
		socketService.on(SocketEventEnum.ROOM_STATE, callbacks.onRoomState),
		socketService.on(SocketEventEnum.PLAYER_JOINED, callbacks.onPlayerJoined),
		socketService.on(SocketEventEnum.PLAYER_LEFT, callbacks.onPlayerLeft),
		socketService.on(SocketEventEnum.COUNTDOWN_START, callbacks.onCountdown),
		socketService.on(SocketEventEnum.RACE_START, callbacks.onRaceStart),
		socketService.on(
			SocketEventEnum.PROGRESS_UPDATE,
			callbacks.onProgressUpdate,
		),
		socketService.on(SocketEventEnum.RACE_FINISHED, callbacks.onRaceFinished),
		socketService.on(SocketEventEnum.WORDS_APPENDED, callbacks.onWordsAppended),
		socketService.on(SocketEventEnum.HOST_PROMOTED, callbacks.onHostPromoted),
		socketService.on(SocketEventEnum.ROOM_UPDATE, callbacks.onRoomState),
		socketService.on(SocketEventEnum.RESULT_SAVED, callbacks.onResultSaved),
	];

	socketService.send(SocketActionEnum.JOIN_ROOM, { roomId, username });

	return () => {
		for (const unsub of unsubs) unsub();
	};
}
