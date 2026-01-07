import { beforeEach, describe, expect, it } from 'vitest';
import { ResultService } from '../../src/services/ResultService';
import { FakeResultRepository } from '../fakes/FakeResultRepository';

describe('ResultService', () => {
	let resultService: ResultService;
	let fakeRepo: FakeResultRepository;

	beforeEach(() => {
		fakeRepo = new FakeResultRepository();
		resultService = new ResultService(fakeRepo);
	});

	it('should save result if userId is provided', async () => {
		const result = await resultService.saveResult(
			'user-1',
			'preset-1',
			100,
			110,
			98,
			95,
			0,
			[{ key: 'a', timestamp: 10 }],
			'target',
		);

		expect(result).toBeTruthy();
	});

	it('should NOT save result if userId is null', async () => {
		const result = await resultService.saveResult(
			null,
			'preset-1',
			100,
			110,
			98,
			95,
			0,
			[],
			'target',
		);

		expect(result).toBeFalsy();
	});

	it('should get user results', async () => {
		await fakeRepo.create(
			{
				userId: 'user-1',
				presetId: null,
				wpm: 60,
				raw: 60,
				accuracy: 100,
				consistency: 100,
				afkDuration: 0,
			},
			[],
			'target',
		);
		await fakeRepo.create(
			{
				userId: 'user-2',
				presetId: null,
				wpm: 50,
				raw: 50,
				accuracy: 100,
				consistency: 100,
				afkDuration: 0,
			},
			[],
			'target',
		);

		const results = await resultService.getUserResults('user-1');
		expect(results).toHaveLength(1);
		expect(results[0]?.wpm).toBe(60);
	});
});
