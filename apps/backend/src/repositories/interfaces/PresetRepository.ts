import type { RoomConfig } from '@qwertix/room-contracts';
import type { Preset } from '@/db/schema';

export interface PresetRepository {
	create(data: {
		name: string;
		config: RoomConfig;
		isCustom: boolean;
		createdBy?: string;
	}): Promise<Preset>;
	findSystemPresets(): Promise<Preset[]>;
	findByUserId(userId: string): Promise<Preset[]>;
	findById(id: string): Promise<Preset | undefined>;
}
