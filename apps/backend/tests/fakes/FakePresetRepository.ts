import type { RoomConfig } from '@qwertix/room-contracts';
import type { Preset } from '../../src/db/schema';
import type { PresetRepository } from '../../src/repositories/interfaces/PresetRepository';

export class FakePresetRepository implements PresetRepository {
	private presets = new Map<number, Preset>();
	private nextId = 1;

	async create(data: {
		name: string;
		config: RoomConfig;
		isCustom: boolean;
		createdBy?: number;
	}): Promise<Preset> {
		const preset: Preset = {
			id: this.nextId++,
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

	async findByUserId(userId: number): Promise<Preset[]> {
		return Array.from(this.presets.values()).filter(
			(p) => p.createdBy === userId,
		);
	}

	async findById(id: number): Promise<Preset | undefined> {
		return this.presets.get(id);
	}
}
