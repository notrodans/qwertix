import type { FastifyInstance } from 'fastify';
import {
	calculateAccuracy,
	calculateCorrectCharacters,
	calculateWPM,
	reconstructText,
} from '../domain/room/services/typing-logic';
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

		app.post('/results', async (req, _reply) => {
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
			};

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

			const savedResult = await this.resultService.saveResult(
				body.userId || null,
				body.presetId || null,
				wpm,
				raw,
				accuracy,
				consistency,
				body.replayData,
				body.targetText,
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
