import crypto from 'node:crypto';
import type { RoomConfig } from '@qwertix/room-contracts';
import type { Preset } from '../../src/db/schema';
import type { PresetRepository } from '../../src/repositories/interfaces/PresetRepository';

export class FakePresetRepository implements PresetRepository {
	private presets = new Map<string, Preset>();

	async create(data: {
		name: string;
		config: RoomConfig;
		isCustom: boolean;
		createdBy?: string;
	}): Promise<Preset> {
		const preset: Preset = {
			id: crypto.randomUUID(),
			name: data.name,
			config: data.config,
			isCustom: data.isCustom,
			createdBy: data.createdBy ?? null,
			createdAt: new Date(),
		};
		this.presets.set(preset.id, preset);
		return preset;
	}

	async findSystemPresets(): Promise<Preset[]> {
		return Array.from(this.presets.values()).filter((p) => !p.isCustom);
	}

	async findByUserId(userId: string): Promise<Preset[]> {
		return Array.from(this.presets.values()).filter(
			(p) => p.createdBy === userId,
		);
	}

	async findById(id: string): Promise<Preset | undefined> {
		return this.presets.get(id);
	}
}
