import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { container } from '../src/container';
import type { User } from '../src/db/schema';
import type { ResultRepository } from '../src/repositories/interfaces/ResultRepository';
import type { UserRepository } from '../src/repositories/interfaces/UserRepository';

describe('Result Repository Transaction', () => {
	let userRepo: UserRepository;
	let resultRepo: ResultRepository;
	let user: User;

	beforeAll(async () => {
		await app.ready();
		userRepo = container.resolve<UserRepository>('userRepo');
		resultRepo = container.resolve<ResultRepository>('resultRepo');

		// Create a test user
		// We use a unique email to avoid collisions if DB isn't perfectly cleaned or parallel runs
		const timestamp = Date.now();
		user = await userRepo.create({
			email: `transaction-test-${timestamp}@example.com`,
			username: 'transactionUser',
			passwordHash: 'hash',
		});
	});

	it('should rollback result creation if replay insertion fails', async () => {
		// Postgres JSONB throws error on null bytes \u0000
		const invalidReplayData = [
			{ key: 'a', timestamp: 100 },
			{ key: 'b\u0000', timestamp: 200 },
		];

		const resultData = {
			userId: user.id,
			presetId: null,
			wpm: 100,
			raw: 100,
			accuracy: 100,
			consistency: 100,
			afkDuration: 0,
		};

		// 1. Attempt to create result with invalid replay data
		// This triggers the transaction: insert result -> insert replays (fail) -> rollback
		await expect(
			resultRepo.create(resultData, invalidReplayData, 'target'),
		).rejects.toThrow();

		// 2. Verify result was NOT created (rollback successful)
		const results = await resultRepo.findByUserId(user.id);
		expect(results).toHaveLength(0);
	});

	it('should successfully create result and replays if data is valid', async () => {
		const validReplayData = [{ key: 'a', timestamp: 100 }];

		const resultData = {
			userId: user.id,
			presetId: null,
			wpm: 100,
			raw: 100,
			accuracy: 100,
			consistency: 100,
			afkDuration: 0,
		};

		const result = await resultRepo.create(
			resultData,
			validReplayData,
			'target',
		);
		expect(result).toBeDefined();

		const results = await resultRepo.findByUserId(user.id);
		expect(results).toHaveLength(1);
		expect(results[0]!.id).toBe(result.id);
	});
});
