import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataBase } from '../src/db';
import { PresetService } from '../src/services/preset.service';

const { mockSelect, mockInsert, mockExecute } = vi.hoisted(() => {
	const mockExecute = vi.fn();
	const mockReturning = vi.fn(() => ({ execute: mockExecute }));
	const mockValues = vi.fn(() => ({ returning: mockReturning }));
	const mockWhere = vi.fn(() => ({ execute: mockExecute }));
	const mockFrom = vi.fn(() => ({ where: mockWhere }));
	const mockSelect = vi.fn(() => ({ from: mockFrom }));
	const mockInsert = vi.fn(() => ({ values: mockValues }));

	return {
		mockSelect,
		mockInsert,
		mockExecute,
	};
});

describe('PresetService', () => {
	let presetService: PresetService;
	let mockDb: DataBase;

	beforeEach(() => {
		mockDb = {
			source: {
				select: mockSelect,
				insert: mockInsert,
			} as unknown as DataBase['source'],
		} as DataBase;
		presetService = new PresetService(mockDb);
		vi.clearAllMocks();
	});

	it('should create a preset', async () => {
		const mockPreset = { id: 1, name: 'Test', config: {}, isCustom: true };
		mockExecute.mockResolvedValue([mockPreset]);

		const result = await presetService.createPreset(
			'Test',
			{ mode: 'WORDS', wordCount: 10, duration: 0 },
			1,
		);

		expect(mockInsert).toHaveBeenCalled();
		expect(result).toEqual(mockPreset);
	});

	it('should get system presets', async () => {
		const mockPresets = [{ id: 1, isCustom: false }];
		mockExecute.mockResolvedValue(mockPresets);

		const result = await presetService.getSystemPresets();

		expect(mockSelect).toHaveBeenCalled();
		expect(result).toEqual(mockPresets);
	});
});
