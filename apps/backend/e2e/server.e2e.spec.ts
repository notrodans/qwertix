import type { AddressInfo } from 'net';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import WebSocket from 'ws';
import { app, server } from '../src/app';

describe('Backend E2E', () => {
	// Use a random available port
	const PORT = 0;

	beforeAll(() => {
		return new Promise<void>((resolve) => {
			server.listen(PORT, () => {
				resolve();
			});
		});
	});

	afterAll(() => {
		return new Promise<void>((resolve) => {
			server.close(() => {
				resolve();
			});
		});
	});

	it('responds with status ok on health check endpoint', async () => {
		const response = await request(app).get('/health');
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('status', 'ok');
	});

	it('echoes messages via websocket connection', async () => {
		const { port } = server.address() as AddressInfo;
		const wsUrl = `ws://localhost:${port}`;
		const client = new WebSocket(wsUrl);

		const messageToSend = 'Hello Qwertix';

		const receivedMessage = await new Promise<string>((resolve, reject) => {
			client.on('open', () => {
				client.send(messageToSend);
			});

			client.on('message', (data) => {
				resolve(data.toString());
				client.close();
			});

			client.on('error', (err) => {
				reject(err);
			});
		});

		expect(receivedMessage).toBe(`Echo: ${messageToSend}`);
	});
});
