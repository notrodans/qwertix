import type { RoomConfig } from '@qwertix/room-contracts';
import type { FastifyInstance } from 'fastify';
import { PresetService } from '../services/preset.service';
import { RoomService } from '../services/room.service';

export class RoomController {
	constructor(
		private roomService: RoomService,
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

			const room = await this.roomService.createRoom(config, body?.presetId);
			return reply.send({ roomId: room.id() });
		});

		app.get('/rooms/:roomId', async (req, reply) => {
			const { roomId } = req.params as { roomId: string };
			const room = await this.roomService.get(roomId);

			if (!room) {
				return reply.status(404).send({ error: 'Room not found' });
			}

			return reply.send(room.toDTO());
		});
	}
}
