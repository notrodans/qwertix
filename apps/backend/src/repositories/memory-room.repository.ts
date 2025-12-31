import type { Room } from '@/domain/room/room.aggregate';
import type { IRoomRepository } from './memory-room';

export class InMemoryRoomRepository implements IRoomRepository {
	private rooms = new Map<string, Room>();

	async save(room: Room): Promise<void> {
		this.rooms.set(room.id(), room);
	}

	async findById(id: string): Promise<Room | undefined> {
		return this.rooms.get(id);
	}

	async delete(id: string): Promise<void> {
		this.rooms.delete(id);
	}
}
