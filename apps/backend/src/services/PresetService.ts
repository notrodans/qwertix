import type { RoomConfig } from '@qwertix/room-contracts';
import type { Preset } from '@/db/schema';
import type { PresetRepository } from '@/repositories/interfaces/PresetRepository';

/**
 * Service for managing game presets.
 */
export class PresetService {
	constructor(private presetRepo: PresetRepository) {}

	/**
	 * Creates a new preset.
	 * @param name - The name of the preset.
	 * @param config - The room configuration for the preset.
	 * @param userId - The ID of the user creating the preset (optional).
	 * @returns The created preset.
	 */
	async createPreset(
		name: string,
		config: RoomConfig,
		userId?: string,
	): Promise<Preset> {
		return await this.presetRepo.create({
			name,
			config,
			isCustom: true,
			createdBy: userId,
		});
	}

	/**
	 * Retrieves all system (non-custom) presets.
	 * @returns An array of system presets.
	 */
	async getSystemPresets() {
		return await this.presetRepo.findSystemPresets();
	}

	/**
	 * Retrieves all presets created by a specific user.
	 * @param userId - The ID of the user.
	 * @returns An array of presets created by the user.
	 */
	async getUserPresets(userId: string) {
		return await this.presetRepo.findByUserId(userId);
	}

	/**
	 * Retrieves a preset by its ID.
	 * @param id - The ID of the preset.
	 * @returns The preset if found, otherwise undefined.
	 */
	async getPresetById(id: string) {
		return await this.presetRepo.findById(id);
	}
}
