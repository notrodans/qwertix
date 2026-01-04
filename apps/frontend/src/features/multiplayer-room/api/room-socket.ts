import { env } from '@env';
import type { ParticipantDTO, RoomDTO } from '@qwertix/room-contracts';
import { socketService } from '@/shared/api/socket';

export interface RoomSocketCallbacks {
	onRoomState: (room: RoomDTO) => void;
	onPlayerJoined: (participant: ParticipantDTO) => void;
	onPlayerLeft: (payload: { userId: string }) => void;
	onCountdown: (payload: { startTime: number }) => void;
	onRaceStart: () => void;
	onProgressUpdate: (participants: ParticipantDTO[]) => void;
	onRaceFinished: (payload: { leaderboard: ParticipantDTO[] }) => void;
	onWordsAppended: (payload: { words: string[] }) => void;
	onHostPromoted: (payload: { message: string }) => void;
	onError: (payload: { message: string }) => void;
	onResultSaved: (payload: { success: boolean }) => void;
}

export function connectToRoom(
	roomId: string,
	username: string,
	callbacks: RoomSocketCallbacks,
) {
	socketService.connect(env.VITE_WS_URL);

	const unsubs = [
		socketService.on('ROOM_STATE', callbacks.onRoomState),
		socketService.on('PLAYER_JOINED', callbacks.onPlayerJoined),
		socketService.on('PLAYER_LEFT', callbacks.onPlayerLeft),
		socketService.on('COUNTDOWN_START', callbacks.onCountdown),
		socketService.on('RACE_START', callbacks.onRaceStart),
		socketService.on('PROGRESS_UPDATE', callbacks.onProgressUpdate),
		socketService.on('RACE_FINISHED', callbacks.onRaceFinished),
		socketService.on('WORDS_APPENDED', callbacks.onWordsAppended),
		socketService.on('HOST_PROMOTED', callbacks.onHostPromoted),
		socketService.on('ROOM_UPDATE', callbacks.onRoomState),
		socketService.on('ERROR', callbacks.onError),
		socketService.on('RESULT_SAVED', callbacks.onResultSaved),
	];

	const join = () => {
		socketService.send('JOIN_ROOM', { roomId, username });
	};

	if (socketService.connected()) {
		join();
	} else {
		unsubs.push(socketService.on('CONNECTED', join));
	}

	return () => {
		socketService.disconnect();
		for (const unsub of unsubs) unsub();
	};
}
