import { RaceModeEnum, type RoomConfig } from '@qwertix/room-contracts';
import { v4 as uuid } from 'uuid';
import { Room } from '@/domain/room/room.aggregate';
import { type IRoomRepository } from '@/repositories/memory-room';
import { WordService } from '../services/word-service';

export class RoomService {
	constructor(
		private roomRepo: IRoomRepository,
		private wordService: WordService,
	) {}

	async createRoom(config?: RoomConfig, presetId?: number): Promise<Room> {
		const roomId = uuid().substring(0, 6).toUpperCase();

		const finalConfig = config || { mode: RaceModeEnum.WORDS, wordCount: 30 };
		const initialCount =
			finalConfig.mode === RaceModeEnum.WORDS ? finalConfig.wordCount : 50;

		const text = this.wordService.getWords(initialCount);

		const room = new Room(roomId, finalConfig, text, presetId);

		await this.roomRepo.save(room);
		return room;
	}

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

	async get(id: string): Promise<Room | undefined> {
		return await this.roomRepo.findById(id);
	}

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

	async appendWordsToRoom(
		roomId: string,
		count: number,
	): Promise<string[] | null> {
		const room = await this.roomRepo.findById(roomId);
		if (!room) return null;

		const newWords = this.wordService.getWords(count);
		const currentConfig = room.config();
		const currentText = room.text();

		room.updateConfig(currentConfig, [...currentText, ...newWords]);
		await this.roomRepo.save(room);
		return newWords;
	}

	async delete(id: string): Promise<void> {
		await this.roomRepo.delete(id);
	}
}
