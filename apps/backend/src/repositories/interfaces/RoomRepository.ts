import type { Room } from '@/domain/room/Room';

export interface RoomRepository {
	save(room: Room): Promise<void>;
	findById(id: string): Promise<Room | undefined>;
	delete(id: string): Promise<void>;
}
