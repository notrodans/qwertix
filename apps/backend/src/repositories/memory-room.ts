import type { Room } from '@/domain/room/room.aggregate';

export interface IRoomRepository {
	save(room: Room): Promise<void>;
	findById(id: string): Promise<Room | undefined>;
	delete(id: string): Promise<void>;
}
