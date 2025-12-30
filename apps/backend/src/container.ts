import { asClass, asValue, createContainer, InjectionMode } from 'awilix';
import type { FastifyInstance } from 'fastify';
import { WebSocketServer } from 'ws';
import { AuthController } from './controllers/auth.controller';
import { PresetController } from './controllers/preset.controller';
import { ResultController } from './controllers/result.controller';
import { RoomController } from './controllers/room.controller';
import { DataBase } from './db';
import { RoomManager } from './managers/room.manager';
import { SocketManager } from './managers/socket.manager.ts';
import { AuthService } from './services/auth.service';
import { PresetService } from './services/preset.service';
import { ResultService } from './services/result.service';
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
		roomManager: asClass(RoomManager).singleton(),
		wordService: asClass(WordService).singleton(),
		socketManager: asClass(SocketManager).singleton(),
		authService: asClass(AuthService).singleton(),
		presetService: asClass(PresetService).singleton(),
		resultService: asClass(ResultService).singleton(),

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
