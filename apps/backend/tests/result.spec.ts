import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataBase } from '../src/db';
import { ResultService } from '../src/services/result.service';

const { mockInsert, mockExecute } = vi.hoisted(() => {
	const mockExecute = vi.fn();
	const mockReturning = vi.fn(() => ({ execute: mockExecute }));
	const mockValues = vi.fn(() => ({
		returning: mockReturning,
		execute: mockExecute,
	}));

	return {
		mockInsert: vi.fn(() => ({ values: mockValues })),
		mockExecute,
	};
});

describe('ResultService', () => {
	let resultService: ResultService;
	let mockDb: DataBase;

	beforeEach(() => {
		mockDb = {
			source: {
				insert: mockInsert,
			} as unknown as DataBase['source'],
		} as DataBase;
		resultService = new ResultService(mockDb);
		vi.clearAllMocks();
	});

	it('should save result if userId is provided', async () => {
		const mockResult = { id: 100 };
		mockExecute.mockResolvedValue([mockResult]);

		const result = await resultService.saveResult(1, 1, 100, 110, 98, 95, [
			{ key: 'a', timestamp: 10 },
		]);

		expect(mockInsert).toHaveBeenCalled();
		expect(result).toEqual(mockResult);
	});

	it('should NOT save result if userId is null', async () => {
		const result = await resultService.saveResult(
			null,
			1,
			100,
			110,
			98,
			95,
			[],
		);

		expect(mockInsert).not.toHaveBeenCalled();
		expect(result).toBeNull();
	});
});
