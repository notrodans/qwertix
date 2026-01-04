import type { RoomConfig } from '@qwertix/room-contracts';
import type { Preset } from '@/db/schema';

export interface PresetRepository {
	create(data: {
		name: string;
		config: RoomConfig;
		isCustom: boolean;
		createdBy?: number;
	}): Promise<Preset>;
	findSystemPresets(): Promise<Preset[]>;
	findByUserId(userId: number): Promise<Preset[]>;
	findById(id: number): Promise<Preset | undefined>;
}
