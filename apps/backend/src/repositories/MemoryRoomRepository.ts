import type { Room } from '@/domain/room/Room';
import type { RoomRepository } from './interfaces/RoomRepository';

/**
 * In-memory implementation of IRoomRepository.
 * Useful for development and testing.
 */
export class MemoryRoomRepository implements RoomRepository {
	private rooms = new Map<string, Room>();

	/**
	 * Saves a room to the repository.
	 * @param room - The room to save.
	 */
	async save(room: Room): Promise<void> {
		this.rooms.set(room.id(), room);
	}

	/**
	 * Finds a room by its ID.
	 * @param id - The ID of the room.
	 * @returns The room if found, otherwise undefined.
	 */
	async findById(id: string): Promise<Room | undefined> {
		return this.rooms.get(id);
	}

	/**
	 * Deletes a room by its ID.
	 * @param id - The ID of the room to delete.
	 */
	async delete(id: string): Promise<void> {
		this.rooms.delete(id);
	}
}
