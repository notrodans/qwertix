import {
	RaceModeEnum,
	type RoomConfig,
	RoomStatusEnum,
} from '@qwertix/room-contracts';
import { Room } from '@/domain/room/Room';
import { type RoomRepository } from '@/repositories/interfaces/RoomRepository';
import { WordService } from './WordService';

/**
 * Service for managing multiplayer rooms.
 */
export class RoomService {
	constructor(
		private roomRepo: RoomRepository,
		private wordService: WordService,
	) {}

	/**
	 * Checks for inactive rooms/participants and prunes them.
	 * @returns List of removed participants with roomIds.
	 */
	async checkInactivity(): Promise<
		{ roomId: string; removedParticipants: string[] }[]
	> {
		const rooms = await this.roomRepo.getAll();
		const result: { roomId: string; removedParticipants: string[] }[] = [];
		const now = Date.now();
		const LOBBY_TIMEOUT = 10 * 60 * 1000; // 10 minutes

		for (const room of rooms) {
			if (room.status() !== RoomStatusEnum.LOBBY) continue;

			const removed: string[] = [];
			for (const participant of room.participants().values()) {
				if (now - participant.lastActiveAt > LOBBY_TIMEOUT) {
					room.removeParticipant(participant.socketId);
					removed.push(participant.socketId);
				}
			}

			if (removed.length > 0) {
				await this.roomRepo.save(room);
				result.push({ roomId: room.id(), removedParticipants: removed });
			}
		}
		return result;
	}

	/**
	 * Creates a new room with the specified configuration.
	 * @param config - The room configuration (optional).
	 * @param presetId - The ID of the preset used (optional).
	 * @returns The created room.
	 */
	async createRoom(config?: RoomConfig, presetId?: string): Promise<Room> {
		const finalConfig = config || { mode: RaceModeEnum.WORDS, wordCount: 30 };
		const initialCount =
			finalConfig.mode === RaceModeEnum.WORDS ? finalConfig.wordCount : 50;

		const text = this.wordService.getWords(initialCount);

		const room = new Room(finalConfig, text, presetId);

		await this.roomRepo.save(room);
		return room;
	}

	/**
	 * Updates the progress of a participant in a room.
	 * @param roomId - The ID of the room.
	 * @param socketId - The socket ID of the participant.
	 * @param typedLength - The length of the text typed so far.
	 */
	async updateProgress(
		roomId: string,
		socketId: string,
		typedLength: number,
	): Promise<void> {
		const room = await this.roomRepo.findById(roomId);
		if (!room) throw new Error('Room not found');

		room.updateParticipantProgress(socketId, typedLength);

		await this.roomRepo.save(room);
	}

	/**
	 * Adds a participant to a room.
	 * @param roomId - The ID of the room.
	 * @param socketId - The socket ID of the participant.
	 * @param username - The username of the participant.
	 * @returns The updated room.
	 */
	async joinRoom(
		roomId: string,
		socketId: string,
		username: string,
	): Promise<Room> {
		const room = await this.roomRepo.findById(roomId);
		if (!room) throw new Error('Room not found');

		room.addParticipant(socketId, username);

		await this.roomRepo.save(room);
		return room;
	}

	/**
	 * Retrieves a room by its ID.
	 * @param id - The ID of the room.
	 * @returns The room if found, otherwise undefined.
	 */
	async get(id: string): Promise<Room | undefined> {
		return await this.roomRepo.findById(id);
	}

	/**
	 * Updates the configuration of a room.
	 * @param roomId - The ID of the room.
	 * @param config - The new room configuration.
	 * @returns True if the update was successful, false otherwise.
	 */
	async updateRoomConfig(roomId: string, config: RoomConfig): Promise<boolean> {
		const room = await this.roomRepo.findById(roomId);
		if (!room) return false;

		const initialCount =
			config.mode === RaceModeEnum.WORDS ? config.wordCount : 50;
		const text = this.wordService.getWords(initialCount);

		room.updateConfig(config, text);
		await this.roomRepo.save(room);
		return true;
	}

	/**
	 * Appends more words to the text of a room.
	 * @param roomId - The ID of the room.
	 * @param count - The number of words to append.
	 * @returns The appended words if successful, null otherwise.
	 */
	async appendWordsToRoom(
		roomId: string,
		count: number,
	): Promise<string[] | null> {
		const room = await this.roomRepo.findById(roomId);
		if (!room) return null;

		const newWords = this.wordService.getWords(count);
		room.appendWords(newWords);
		await this.roomRepo.save(room);
		return newWords;
	}

	/**
	 * Restarts a room, resetting its state and generating new text.
	 * @param roomId - The ID of the room.
	 * @returns True if the restart was successful, false otherwise.
	 */
	async restartRoom(roomId: string): Promise<boolean> {
		const room = await this.roomRepo.findById(roomId);
		if (!room) return false;

		const config = room.config();
		const initialCount =
			config.mode === RaceModeEnum.WORDS ? config.wordCount : 50;
		const newText = this.wordService.getWords(initialCount);

		room.restart(newText);
		await this.roomRepo.save(room);
		return true;
	}

	/**
	 * Deletes a room by its ID.
	 * @param id - The ID of the room.
	 */
	async delete(id: string): Promise<void> {
		await this.roomRepo.delete(id);
	}
}
