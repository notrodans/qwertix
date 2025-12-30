import fastifyPassport from '@fastify/passport';
import type { FastifyInstance } from 'fastify';
import type { RoomConfig } from '@/domain/room';
import { PresetService } from '../services/preset.service';

export class PresetController {
	constructor(private presetService: PresetService) {}

	async register(app: FastifyInstance) {
		app.get('/presets', async (_req, reply) => {
			const systemPresets = await this.presetService.getSystemPresets();
			return reply.send(systemPresets);
		});

		app.post(
			'/presets',
			{
				preValidation: fastifyPassport.authenticate('jwt', { session: false }),
			},
			async (req, reply) => {
				const { name, config } = req.body as {
					name: string;
					config: RoomConfig;
				};
				const user = req.user as { id: number };

				if (!user) {
					return reply.status(401).send({ error: 'Unauthorized' });
				}

				const preset = await this.presetService.createPreset(
					name,
					config,
					user.id,
				);
				return reply.send(preset);
			},
		);
	}
}
