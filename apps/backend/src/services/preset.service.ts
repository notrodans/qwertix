import type { RoomConfig } from '@qwertix/room-contracts';
import { eq } from 'drizzle-orm';
import { DataBase } from '@/db';
import { presets } from '@/db/schema';

export class PresetService {
	constructor(private db: DataBase) {}

	async createPreset(name: string, config: RoomConfig, userId?: number) {
		const preset = await this.db.source
			.insert(presets)
			.values({
				name,
				config,
				isCustom: true,
				createdBy: userId,
			})
			.returning()
			.execute();
		return preset[0];
	}

	async getSystemPresets() {
		return await this.db.source
			.select()
			.from(presets)
			.where(eq(presets.isCustom, false))
			.execute();
	}

	async getUserPresets(userId: number) {
		return await this.db.source
			.select()
			.from(presets)
			.where(eq(presets.createdBy, userId))
			.execute();
	}

	async getPresetById(id: number) {
		const preset = await this.db.source
			.select()
			.from(presets)
			.where(eq(presets.id, id))
			.execute();
		return preset[0];
	}
}
