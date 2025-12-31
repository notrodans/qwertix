import { asClass, asValue, createContainer, InjectionMode } from 'awilix';
import type { FastifyInstance } from 'fastify';
import { WebSocketServer } from 'ws';
import { AuthController } from './controllers/auth.controller';
import { PresetController } from './controllers/preset.controller';
import { ResultController } from './controllers/result.controller';
import { RoomController } from './controllers/room.controller';
import { DataBase } from './db';
import { SocketManager } from './managers/socket.manager';
import { InMemoryRoomRepository } from './repositories/memory-room.repository';
import { AuthService } from './services/auth.service';
import { PresetService } from './services/preset.service';
import { ResultService } from './services/result.service';
import { RoomService } from './services/room.service';
import { WordService } from './services/word-service';

export const container = createContainer({
	injectionMode: InjectionMode.CLASSIC,
});

export function setupContainer(
	wss: WebSocketServer,
	fastifyApp: FastifyInstance,
) {
	container.register({
		db: asClass(DataBase).singleton(),
		wordService: asClass(WordService).singleton(),
		roomRepo: asClass(InMemoryRoomRepository).singleton(),
		socketManager: asClass(SocketManager).singleton(),
		authService: asClass(AuthService).singleton(),
		presetService: asClass(PresetService).singleton(),
		resultService: asClass(ResultService).singleton(),
		roomService: asClass(RoomService).singleton(),

		authController: asClass(AuthController).singleton(),
		presetController: asClass(PresetController).singleton(),
		resultController: asClass(ResultController).singleton(),
		roomController: asClass(RoomController).singleton(),

		wss: asValue(wss),
		app: asValue(fastifyApp),
		logger: asValue(fastifyApp.log),
	});

	// Resolve socketManager to start listening
	container.resolve('socketManager');

	return container;
}
