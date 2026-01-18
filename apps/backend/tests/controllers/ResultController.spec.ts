import {
	calculateAccuracy,
	calculateCorrectCharacters,
	calculateResultHash,
	calculateWPM,
	reconstructText,
} from '@qwertix/room-contracts';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResultController } from '../../src/controllers/ResultController';
import { ResultService } from '../../src/services/ResultService';

// Mock dependencies
const mockResultService = {
	saveResult: vi.fn(),
	getResultById: vi.fn(),
	getReplayByResultId: vi.fn(),
	getUserResults: vi.fn(),
} as unknown as ResultService;

const mockReply = {
	status: vi.fn().mockReturnThis(),
	send: vi.fn(),
};

// Mock env
vi.mock('../../src/env', () => ({
	env: {
		NODE_ENV: 'production', // Force production to enable checks
		RESULT_HASH_SALT: 'test-salt',
	},
}));

// Mock room-contracts to control verification logic if needed,
// but using real logic is better for integration.

describe('ResultController', () => {
	let controller: ResultController;

	beforeEach(() => {
		controller = new ResultController(mockResultService);
		vi.clearAllMocks();
	});

	// Helper to simulate request
	// biome-ignore lint/suspicious/noExplicitAny: mocking legacy request
	const simulatePost = async (body: any) => {
		const mockApp = {
			get: vi.fn(),
			post: vi.fn(),
		};
		// biome-ignore lint/suspicious/noExplicitAny: mock app structure
		await controller.register(mockApp as any);

		const postCall = mockApp.post.mock.calls.find(
			(call) => call[0] === '/results',
		);
		if (!postCall) throw new Error('POST /results handler not registered');

		const postHandler = postCall[1];
		return await postHandler({ body }, mockReply); // Return the result
	};

	it('should reject invalid hash', async () => {
		const body = {
			wpm: 100,
			raw: 100,
			accuracy: 100,
			consistency: 100,
			startTime: 1000,
			endTime: 2000,
			afkDuration: 0,
			targetText: 'hello',
			hash: 'invalid-hash', // Wrong hash
			replayData: [],
		};

		await simulatePost(body);

		expect(mockReply.status).toHaveBeenCalledWith(400);
		expect(mockReply.send).toHaveBeenCalledWith(
			expect.objectContaining({ error: 'Invalid result hash' }),
		);
	});

	it('should reject manipulated stats (mismatch verification)', async () => {
		// Valid hash for "fake" stats
		const salt = 'test-salt';
		const validHash = await calculateResultHash(
			100,
			100,
			100,
			100,
			1000,
			2000,
			0,
			'hello',
			salt,
		);

		// Body claims 100 WPM, but replay data is empty -> calculated WPM will be 0.
		const body = {
			wpm: 100,
			raw: 100,
			accuracy: 100,
			consistency: 100,
			startTime: 1000,
			endTime: 2000,
			afkDuration: 0,
			targetText: 'hello',
			hash: validHash,
			replayData: [], // Empty replay -> 0 WPM
		};

		await simulatePost(body);

		expect(mockReply.status).toHaveBeenCalledWith(400);
		expect(mockReply.send).toHaveBeenCalledWith(
			expect.objectContaining({ error: 'Stats verification failed' }),
		);
	});

	it('should save result if valid', async () => {
		const targetText = 'hello';
		const startTime = 1000;
		const endTime = 2000;
		const replayData = [
			{ key: 'h', timestamp: 100 },
			{ key: 'e', timestamp: 200 },
			{ key: 'l', timestamp: 300 },
			{ key: 'l', timestamp: 400 },
			{ key: 'o', timestamp: 500 },
		];

		const reconstructed = reconstructText(replayData);
		const correct = calculateCorrectCharacters(reconstructed, targetText);
		const wpm = Math.round(calculateWPM(correct, startTime, endTime));
		const raw = Math.round(
			calculateWPM(reconstructed.length, startTime, endTime),
		);
		const accuracy = calculateAccuracy(reconstructed, targetText);

		const salt = 'test-salt';
		const hash = await calculateResultHash(
			wpm,
			raw,
			accuracy,
			100,
			startTime,
			endTime,
			0,
			targetText,
			salt,
		);

		const body = {
			userId: 'user-1',
			wpm,
			raw,
			accuracy,
			consistency: 100,
			startTime,
			endTime,
			afkDuration: 0,
			targetText,
			hash,
			replayData,
		};

		// Mock saveResult return
		// biome-ignore lint/suspicious/noExplicitAny: mock resolved value
		(mockResultService.saveResult as any).mockResolvedValue({ id: 'res-1' });

		const result = await simulatePost(body);

		expect(mockResultService.saveResult).toHaveBeenCalled();
		expect(result).toEqual(expect.objectContaining({ id: 'res-1' }));
	});
});
