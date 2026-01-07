import { asClass, asValue, createContainer, InjectionMode } from 'awilix';
import type { FastifyInstance } from 'fastify';
import { WebSocketServer } from 'ws';
import { AuthController } from './controllers/AuthController';
import { PresetController } from './controllers/PresetController';
import { ResultController } from './controllers/ResultController';
import { RoomController } from './controllers/RoomController';
import { DataBase } from './db';
import type { SocketServer } from './interfaces/SocketServer';
import { SocketManager } from './managers/SocketManager';
import { DrizzlePresetRepository } from './repositories/drizzle/DrizzlePresetRepository';
import { DrizzleResultRepository } from './repositories/drizzle/DrizzleResultRepository';
import { DrizzleUserRepository } from './repositories/drizzle/DrizzleUserRepository';
import { MemoryRoomRepository } from './repositories/MemoryRoomRepository';
import { AuthService } from './services/AuthService';
import { PresetService } from './services/PresetService';
import { ResultService } from './services/ResultService';
import { RoomService } from './services/RoomService';
import { WordService } from './services/WordService';

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
		roomRepo: asClass(MemoryRoomRepository).singleton(),

		userRepo: asClass(DrizzleUserRepository).singleton(),
		presetRepo: asClass(DrizzlePresetRepository).singleton(),
		resultRepo: asClass(DrizzleResultRepository).singleton(),

		socketManager: asClass(SocketManager).singleton(),
		authService: asClass(AuthService).singleton(),
		presetService: asClass(PresetService).singleton(),
		resultService: asClass(ResultService).singleton(),
		roomService: asClass(RoomService).singleton(),

		authController: asClass(AuthController).singleton(),
		presetController: asClass(PresetController).singleton(),
		resultController: asClass(ResultController).singleton(),
		roomController: asClass(RoomController).singleton(),

		socketServer: asValue(wss as unknown as SocketServer),
		fastifyApp: asValue(fastifyApp),
		logger: asValue(fastifyApp.log),
	});

	// Resolve socketManager to start listening
	container.resolve('socketManager');

	return container;
}
