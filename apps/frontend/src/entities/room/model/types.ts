import {
	type ParticipantDTO,
	type RoomConfig,
	type RoomDTO,
	RoomStatusEnum,
} from '@qwertix/room-contracts';

export type {
	ParticipantDTO as Participant,
	RoomConfig,
	RoomStatusEnum as RoomStatus,
};
export type Room = RoomDTO;
export { RaceModeEnum, RoomStatusEnum } from '@qwertix/room-contracts';
