import type { FastifyInstance } from 'fastify';
import type { RoomConfig } from '../domain/room';
import { RoomManager } from '../managers/room.manager';
import { PresetService } from '../services/preset.service';

export class RoomController {
	constructor(
		private roomManager: RoomManager,
		private presetService: PresetService,
	) {}

	async register(app: FastifyInstance) {
		app.post('/rooms', async (req, reply) => {
			const body = req.body as { presetId?: number } | undefined;
			let config: RoomConfig | undefined;

			if (body?.presetId) {
				const preset = await this.presetService.getPresetById(body.presetId);
				if (preset) config = preset.config as RoomConfig;
			}

			const room = this.roomManager.createRoom(config);
			return reply.send({ roomId: room.id() });
		});

		app.get('/rooms/:roomId', async (req, reply) => {
			const { roomId } = req.params as { roomId: string };
			const room = this.roomManager.getRoom(roomId);

			if (!room) {
				return reply.status(404).send({ error: 'Room not found' });
			}

			return reply.send(room.toDTO());
		});
	}
}
