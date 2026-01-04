import { RaceModeEnum } from '@qwertix/room-contracts';
import { beforeEach, describe, expect, it } from 'vitest';
import { PresetService } from '../../src/services/PresetService';
import { FakePresetRepository } from '../fakes/FakePresetRepository';

describe('PresetService', () => {
	let presetService: PresetService;
	let fakeRepo: FakePresetRepository;

	beforeEach(() => {
		fakeRepo = new FakePresetRepository();
		presetService = new PresetService(fakeRepo);
	});

	it('should create a preset', async () => {
		const result = await presetService.createPreset(
			'Test',
			{ mode: RaceModeEnum.WORDS, wordCount: 10 },
			1,
		);

		const inRepo = await fakeRepo.findById(result.id);
		expect(inRepo).toBeDefined();
		expect(inRepo?.name).toBe('Test');
		expect(inRepo?.isCustom).toBe(true);
	});

	it('should get system presets', async () => {
		await fakeRepo.create({
			name: 'System',
			config: { mode: RaceModeEnum.WORDS, wordCount: 10 },
			isCustom: false,
		});
		await fakeRepo.create({
			name: 'Custom',
			config: { mode: RaceModeEnum.WORDS, wordCount: 10 },
			isCustom: true,
		});

		const result = await presetService.getSystemPresets();

		expect(result).toHaveLength(1);
		expect(result[0].name).toBe('System');
	});

	it('should get user presets', async () => {
		await fakeRepo.create({
			name: 'User 1 Preset',
			config: { mode: RaceModeEnum.WORDS, wordCount: 10 },
			isCustom: true,
			createdBy: 1,
		});
		await fakeRepo.create({
			name: 'User 2 Preset',
			config: { mode: RaceModeEnum.WORDS, wordCount: 10 },
			isCustom: true,
			createdBy: 2,
		});

		const result = await presetService.getUserPresets(1);

		expect(result).toHaveLength(1);
		expect(result[0].name).toBe('User 1 Preset');
	});
});
