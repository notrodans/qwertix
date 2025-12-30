import type { FastifyBaseLogger } from 'fastify';
import { v4 as uuid } from 'uuid';
import { RaceModeEnum, Room, type RoomConfig } from '../domain/room';
import { WordService } from '../services/word-service';

export class RoomManager {
	private rooms: Map<string, Room> = new Map();

	constructor(
		private wordService: WordService,
		private logger: FastifyBaseLogger,
	) {}

	createRoom(config?: RoomConfig): Room {
		const id = uuid().substring(0, 6).toUpperCase(); // Simple 6 char ID

		// Determine word count based on config (if WORDS mode) or default
		// If TIME mode, we still need initial words.
		// Default config if not provided
		const roomConfig =
			config ||
			({ mode: RaceModeEnum.WORDS, wordCount: 100 } satisfies RoomConfig);

		const initialWordCount =
			roomConfig.mode === RaceModeEnum.WORDS ? roomConfig.wordCount : 50;

		const text = this.wordService.getWords(initialWordCount);
		const room = new Room(id, text, roomConfig);
		this.rooms.set(id, room);
		this.logger.info({ roomId: id, config: roomConfig }, 'Room created');
		return room;
	}

	appendWordsToRoom(roomId: string, count = 20): string[] | null {
		const room = this.getRoom(roomId);
		if (!room) return null;
		const newWords = this.wordService.getWords(count);
		room.appendWords(newWords);
		return newWords;
	}

	updateRoomConfig(roomId: string, config: RoomConfig): boolean {
		const room = this.getRoom(roomId);
		if (!room || room.status !== 'LOBBY') return false;

		const initialWordCount =
			config.mode === RaceModeEnum.WORDS ? config.wordCount : 50;
		const text = this.wordService.getWords(initialWordCount);

		room.updateConfig(config, text);
		return true;
	}

	getRoom(id: string): Room | undefined {
		return this.rooms.get(id);
	}

	deleteRoom(id: string): void {
		this.rooms.delete(id);
	}
}
