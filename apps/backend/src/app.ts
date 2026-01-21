import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import fastifySecureSession from '@fastify/secure-session';
import Fastify from 'fastify';
import { WebSocketServer } from 'ws';
import { container, setupContainer } from './container';
import type { AuthController } from './controllers/AuthController';
import type { PresetController } from './controllers/PresetController';
import type { ResultController } from './controllers/ResultController';
import type { RoomController } from './controllers/RoomController';
import { env } from './env';
import type { WordService } from './services/WordService';

export const app = Fastify({
	logger:
		env.NODE_ENV === 'development'
			? {
					transport: {
						target: 'pino-pretty',
						options: {
							translateTime: 'HH:MM:ss Z',
							ignore: 'pid,hostname',
						},
					},
				}
			: true,
});

app.register(cors);
app.register(fastifyJwt, {
	secret: env.JWT_SECRET,
	decoratorName: 'jwtUser',
});

app.register(fastifySecureSession, {
	secret: Buffer.from(env.JWT_SECRET.padEnd(32).slice(0, 32)), // secure-session requires 32 byte buffer
	salt: Buffer.from('mq9hDxBVDbspDR6n'.padEnd(16).slice(0, 16)),
});

const wss = new WebSocketServer({ server: app.server });
setupContainer(wss, app);

app.register(async (instance) => {
	await container.resolve<AuthController>('authController').register(instance);
});
app.register(async (instance) => {
	await container.resolve<RoomController>('roomController').register(instance);
});
app.register(async (instance) => {
	await container
		.resolve<PresetController>('presetController')
		.register(instance);
});
app.register(async (instance) => {
	await container
		.resolve<ResultController>('resultController')
		.register(instance);
});

app.get('/health', async (_req, _reply) => {
	return { status: 'ok', timestamp: new Date().toISOString() };
});

app.get('/words', async (req, _reply) => {
	const { count } = req.query as { count?: string };
	const wordService = container.resolve<WordService>('wordService');
	return wordService.getWords(count ? parseInt(count) : 30);
});
