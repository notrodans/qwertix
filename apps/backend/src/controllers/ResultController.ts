import {
	calculateAccuracy,
	calculateCorrectCharacters,
	calculateResultHash,
	calculateWPM,
	reconstructText,
} from '@qwertix/room-contracts';
import type { FastifyInstance } from 'fastify';
import { env } from '../env';
import { ResultService } from '../services/ResultService';

/**
 * Controller for handling result-related routes.
 */
export class ResultController {
	constructor(private resultService: ResultService) {}

	/**
	 * Registers result routes with the Fastify app.
	 * @param app - The Fastify application instance.
	 */
	async register(app: FastifyInstance) {
		app.get('/results/:id', async (req, reply) => {
			const { id } = req.params as { id: string };
			const result = await this.resultService.getResultById(id);
			if (!result) return reply.status(404).send({ error: 'Result not found' });
			return result;
		});

		app.get('/results/:id/replay', async (req, reply) => {
			const { id } = req.params as { id: string };
			const replay = await this.resultService.getReplayByResultId(id);
			if (!replay) return reply.status(404).send({ error: 'Replay not found' });
			return replay;
		});

		app.get('/results/user/:userId', async (req) => {
			const { userId } = req.params as { userId: string };
			return await this.resultService.getUserResults(userId);
		});

		app.post('/results', async (req, reply) => {
			const body = req.body as {
				userId?: string;
				presetId?: string;
				targetText: string;
				replayData: {
					key: string;
					timestamp: number;
					ctrlKey?: boolean;
					confirmedIndex?: number;
				}[];
				startTime: number;
				endTime: number;
				consistency: number;
				afkDuration: number;
				wpm: number;
				raw: number;
				accuracy: number;
				hash: string;
			};

			// 1. Verify Hash
			const calculatedHash = await calculateResultHash(
				body.wpm,
				body.raw,
				body.accuracy,
				body.consistency,
				body.startTime,
				body.endTime,
				body.afkDuration,
				body.targetText,
				env.RESULT_HASH_SALT,
			);

			if (env.NODE_ENV !== 'test' && calculatedHash !== body.hash) {
				return reply.status(400).send({ error: 'Invalid result hash' });
			}

			const reconstructed = reconstructText(body.replayData);
			const correctChars = calculateCorrectCharacters(
				reconstructed,
				body.targetText,
			);

			const wpm = Math.round(
				calculateWPM(correctChars, body.startTime, body.endTime),
			);
			const raw = Math.round(
				calculateWPM(reconstructed.length, body.startTime, body.endTime),
			);
			const accuracy = calculateAccuracy(reconstructed, body.targetText);
			const consistency = Math.round(body.consistency);

			// 2. Verify Stats Match (Tolerance check)
			// We allow a small margin of error due to potential timing differences or floating point variations.
			const wpmDiff = Math.abs(wpm - body.wpm);
			const accDiff = Math.abs(accuracy - body.accuracy);

			if (env.NODE_ENV !== 'test' && (wpmDiff > 5 || accDiff > 2)) {
				return reply.status(400).send({
					error: 'Stats verification failed',
					details: {
						server: { wpm, accuracy },
						client: { wpm: body.wpm, accuracy: body.accuracy },
					},
				});
			}

			const savedResult = await this.resultService.saveResult(
				body.userId || null,
				body.presetId || null,
				wpm, // Prefer server-calculated stats for consistency
				raw,
				accuracy,
				consistency,
				Math.round(body.afkDuration),
				body.replayData,
				body.targetText,
				body.hash,
			);

			// Return saved result or just calculated stats for guests
			return (
				savedResult || {
					wpm,
					raw,
					accuracy,
					consistency,
				}
			);
		});
	}
}
