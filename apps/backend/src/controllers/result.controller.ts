import type { FastifyInstance } from 'fastify';
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
	}
}
