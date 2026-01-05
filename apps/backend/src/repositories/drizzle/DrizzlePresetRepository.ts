import type { RoomConfig } from '@qwertix/room-contracts';
import { eq } from 'drizzle-orm';
import { DataBase } from '@/db';
import { type Preset, presets } from '@/db/schema';
import type { PresetRepository } from '../interfaces/PresetRepository';

/**
 * Drizzle implementation of PresetRepository.
 */
export class DrizzlePresetRepository implements PresetRepository {
	constructor(private db: DataBase) {}

	/**
	 * Creates a new preset in the database.
	 * @param data - The preset data.
	 * @returns The created preset.
	 */
	async create(data: {
		name: string;
		config: RoomConfig;
		isCustom: boolean;
		createdBy?: string;
	}): Promise<Preset> {
		const result = await this.db.source
			.insert(presets)
			.values({
				name: data.name,
				config: data.config,
				isCustom: data.isCustom,
				createdBy: data.createdBy,
			})
			.returning()
			.execute();
		const preset = result[0];
		if (!preset) {
			throw new Error('Failed to create preset');
		}
		return preset;
	}

	/**
	 * Finds all system presets (non-custom).
	 * @returns An array of system presets.
	 */
	async findSystemPresets(): Promise<Preset[]> {
		return await this.db.source
			.select()
			.from(presets)
			.where(eq(presets.isCustom, false))
			.execute();
	}

	/**
	 * Finds all presets created by a specific user.
	 * @param userId - The ID of the user.
	 * @returns An array of presets.
	 */
	async findByUserId(userId: string): Promise<Preset[]> {
		return await this.db.source
			.select()
			.from(presets)
			.where(eq(presets.createdBy, userId))
			.execute();
	}

	/**
	 * Finds a preset by its ID.
	 * @param id - The ID of the preset.
	 * @returns The preset if found, otherwise undefined.
	 */
	async findById(id: string): Promise<Preset | undefined> {
		const result = await this.db.source
			.select()
			.from(presets)
			.where(eq(presets.id, id))
			.execute();
		return result[0];
	}
}
