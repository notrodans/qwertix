export enum RoomStatusEnum {
	LOBBY,
	COUNTDOWN,
	RACING,
	FINISHED,
}

export interface ParticipantDTO {
	socketId: string;
	username: string;
	isHost: boolean;
	progress: number;
	wpm: number;
	accuracy: number;
	rank: number | null;
	finishedAt: number | null;
}

export enum RaceModeEnum {
	TIME = 0,
	WORDS = 1,
}

export type RoomConfig =
	| {
			mode: RaceModeEnum.TIME;
			duration: number; // Seconds, for TIME mode
	  }
	| {
			mode: RaceModeEnum.WORDS;
			wordCount: number; // For WORDS mode
	  };

export interface RoomDTO {
	id: string;
	status: RoomStatusEnum;
	participants: ParticipantDTO[];
	config: RoomConfig;
	text: string[];
	startTime?: number;
}

/**
 * Common typing event structure used in replays and stats calculation
 */
export interface ReplayEvent {
	key: string;
	timestamp: number;
	ctrlKey?: boolean;
	confirmedIndex?: number;
}

// --- WebSocket Actions (Client -> Server) ---

export enum SocketActionEnum {
	JOIN_ROOM = 'JOIN_ROOM',
	LEAVE_ROOM = 'LEAVE_ROOM',
	START_RACE = 'START_RACE',
	RESTART_GAME = 'RESTART_GAME',
	LOAD_MORE_WORDS = 'LOAD_MORE_WORDS',
	UPDATE_PROGRESS = 'UPDATE_PROGRESS',
	UPDATE_SETTINGS = 'UPDATE_SETTINGS',
	TRANSFER_HOST = 'TRANSFER_HOST',
	SUBMIT_RESULT = 'SUBMIT_RESULT',
}

export type SocketAction =
	| {
			type: SocketActionEnum.JOIN_ROOM;
			payload: { roomId: string; username: string; token?: string };
	  }
	| { type: SocketActionEnum.LEAVE_ROOM; payload: Record<string, never> }
	| { type: SocketActionEnum.START_RACE; payload: Record<string, never> }
	| { type: SocketActionEnum.RESTART_GAME; payload: Record<string, never> }
	| { type: SocketActionEnum.LOAD_MORE_WORDS; payload: Record<string, never> }
	| { type: SocketActionEnum.UPDATE_PROGRESS; payload: { typedLength: number } }
	| { type: SocketActionEnum.UPDATE_SETTINGS; payload: RoomConfig }
	| { type: SocketActionEnum.TRANSFER_HOST; payload: { targetId: string } }
	| {
			type: SocketActionEnum.SUBMIT_RESULT;
			payload: {
				wpm: number;
				raw: number;
				accuracy: number;
				consistency: number;
				replayData: ReplayEvent[];
			};
	  };

// --- WebSocket Events (Server -> Client) ---

export enum SocketEventEnum {
	ROOM_STATE = 'ROOM_STATE',
	ROOM_UPDATE = 'ROOM_UPDATE',
	PLAYER_JOINED = 'PLAYER_JOINED',
	PLAYER_LEFT = 'PLAYER_LEFT',
	COUNTDOWN_START = 'COUNTDOWN_START',
	RACE_START = 'RACE_START',
	RACE_FINISHED = 'RACE_FINISHED',
	PROGRESS_UPDATE = 'PROGRESS_UPDATE',
	WORDS_APPENDED = 'WORDS_APPENDED',
	HOST_PROMOTED = 'HOST_PROMOTED',
	ERROR = 'ERROR',
	RESULT_SAVED = 'RESULT_SAVED',
}

export type SocketEvent =
	| { type: SocketEventEnum.ROOM_STATE; payload: RoomDTO }
	| { type: SocketEventEnum.ROOM_UPDATE; payload: RoomDTO }
	| { type: SocketEventEnum.PLAYER_JOINED; payload: ParticipantDTO }
	| { type: SocketEventEnum.PLAYER_LEFT; payload: { userId: string } }
	| { type: SocketEventEnum.COUNTDOWN_START; payload: { startTime: number } }
	| { type: SocketEventEnum.RACE_START; payload: Record<string, never> }
	| { type: SocketEventEnum.RACE_FINISHED; payload: { leaderboard: ParticipantDTO[] } }
	| { type: SocketEventEnum.PROGRESS_UPDATE; payload: ParticipantDTO[] }
	| { type: SocketEventEnum.WORDS_APPENDED; payload: { words: string[] } }
	| { type: SocketEventEnum.HOST_PROMOTED; payload: { message: string } }
	| { type: SocketEventEnum.ERROR; payload: { message: string } }
	| {
			type: SocketEventEnum.RESULT_SAVED;
			payload: {
				success: boolean;
				stats?: { wpm: number; accuracy: number; raw: number };
			};
	  };

/**
 * Generic envelope for all socket communication
 */
export interface SocketMessage {
	type: string;
	payload: unknown;
}
