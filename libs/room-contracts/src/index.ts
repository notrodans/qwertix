export type RoomStatus = 'LOBBY' | 'COUNTDOWN' | 'RACING' | 'FINISHED';

export interface Participant {
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
	status: RoomStatus;
	participants: Participant[];
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

export type SocketAction =
	| {
			type: 'JOIN_ROOM';
			payload: { roomId: string; username: string; token?: string };
	  }
	| { type: 'LEAVE_ROOM'; payload: Record<string, never> }
	| { type: 'START_RACE'; payload: Record<string, never> }
	| { type: 'RESTART_GAME'; payload: Record<string, never> }
	| { type: 'LOAD_MORE_WORDS'; payload: Record<string, never> }
	| { type: 'UPDATE_PROGRESS'; payload: { typedLength: number } }
	| { type: 'UPDATE_SETTINGS'; payload: RoomConfig }
	| { type: 'TRANSFER_HOST'; payload: { targetId: string } }
	| {
			type: 'SUBMIT_RESULT';
			payload: {
				wpm: number;
				raw: number;
				accuracy: number;
				consistency: number;
				replayData: ReplayEvent[];
			};
	  };

// --- WebSocket Events (Server -> Client) ---

export type SocketEvent =
	| { type: 'ROOM_STATE'; payload: RoomDTO }
	| { type: 'ROOM_UPDATE'; payload: RoomDTO }
	| { type: 'PLAYER_JOINED'; payload: Participant }
	| { type: 'PLAYER_LEFT'; payload: { userId: string } }
	| { type: 'COUNTDOWN_START'; payload: { startTime: number } }
	| { type: 'RACE_START'; payload: Record<string, never> }
	| { type: 'RACE_FINISHED'; payload: { leaderboard: Participant[] } }
	| { type: 'PROGRESS_UPDATE'; payload: Participant[] }
	| { type: 'WORDS_APPENDED'; payload: { words: string[] } }
	| { type: 'HOST_PROMOTED'; payload: { message: string } }
	| { type: 'ERROR'; payload: { message: string } }
	| {
			type: 'RESULT_SAVED';
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
