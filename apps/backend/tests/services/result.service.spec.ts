import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataBase } from '../../src/db';
import { ResultService } from '../../src/services/result.service';

const { mockInsert, mockSelect, mockExecute } = vi.hoisted(() => {
	const mockExecute = vi.fn();
	const mockReturning = vi.fn(() => ({ execute: mockExecute }));
	const mockValues = vi.fn(() => ({
		returning: mockReturning,
		execute: mockExecute,
	}));
	const mockOrderBy = vi.fn(() => ({ execute: mockExecute }));
	const mockWhere = vi.fn(() => ({
		orderBy: mockOrderBy,
		execute: mockExecute,
	}));
	const mockFrom = vi.fn(() => ({
		where: mockWhere,
		orderBy: mockOrderBy,
		execute: mockExecute,
	}));

	return {
		mockInsert: vi.fn(() => ({ values: mockValues })),
		mockSelect: vi.fn(() => ({ from: mockFrom })),
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
				select: mockSelect,
			} as unknown as DataBase['source'],
		} as DataBase;
		resultService = new ResultService(mockDb);
		vi.clearAllMocks();
	});

	it('should get result by id', async () => {
		const mockResult = { id: 1 };
		mockExecute.mockResolvedValue([mockResult]);

		const result = await resultService.getResultById(1);

		expect(mockSelect).toHaveBeenCalled();
		expect(result).toEqual(mockResult);
	});

	it('should get user results', async () => {
		const mockResults = [{ id: 1 }, { id: 2 }];
		mockExecute.mockResolvedValue(mockResults);

		const results = await resultService.getUserResults(1);

		expect(mockSelect).toHaveBeenCalled();
		expect(results).toEqual(mockResults);
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
