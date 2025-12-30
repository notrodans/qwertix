export type RoomStatus = 'LOBBY' | 'COUNTDOWN' | 'RACING' | 'FINISHED';

export interface Participant {
	socketId: string;
	username: string;
	isHost: boolean;
	progress: number;
	wpm: number;
	rank: number | null;
	finishedAt: number | null;
}

export enum RaceModeEnum {
	TIME,
	WORDS,
}

export type RoomConfig =
	| {
			mode: RaceModeEnum.TIME;
			duration: number; // Seconds, for TIME mode
	  }
	| {
			mode: RaceModeEnum.WORDS;
			wordCount: number; // For WORDS mode or initial chunk for TIME
	  };

export interface RoomDTO {
	id: string;
	status: RoomStatus;
	participants: Participant[];
	config: RoomConfig;
	text: string[];
}
