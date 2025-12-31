import type { FastifyInstance } from 'fastify';
import {
	calculateAccuracy,
	calculateWPM,
	reconstructText,
} from '../domain/typing-logic';
import { ResultService } from '../services/result.service';

export class ResultController {
	constructor(private resultService: ResultService) {}

	async register(app: FastifyInstance) {
		app.get('/results/:id', async (req, reply) => {
			const { id } = req.params as { id: string };
			const result = await this.resultService.getResultById(parseInt(id));
			if (!result) return reply.status(404).send({ error: 'Result not found' });
			return result;
		});

		app.get('/results/user/:userId', async (req) => {
			const { userId } = req.params as { userId: string };
			return await this.resultService.getUserResults(parseInt(userId));
		});

		app.post('/results', async (req, reply) => {
			const body = req.body as {
				userId?: number;
				presetId?: number;
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
			const wpm = calculateWPM(reconstructed.length, body.startTime, body.endTime);
			const accuracy = calculateAccuracy(reconstructed, body.targetText);

			const savedResult = await this.resultService.saveResult(
				body.userId || null,
				body.presetId || null,
				wpm,
				wpm, // raw
				accuracy,
				body.consistency,
				body.replayData,
			);

			// Return saved result or just calculated stats for guests
			return (
				savedResult || {
					wpm,
					raw: wpm,
					accuracy,
					consistency: body.consistency,
				}
			);
		});
	}
}
