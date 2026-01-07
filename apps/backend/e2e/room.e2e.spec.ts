import { SocketActionEnum, SocketEventEnum } from '@qwertix/room-contracts';
import type { AddressInfo } from 'net';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import WebSocket from 'ws';
import { app } from '../src/app';

describe('Room E2E', () => {
	beforeAll(async () => {
		await app.ready();
		await app.listen({ port: 0 });
	});

	afterAll(async () => {
		await app.close();
	});

	it('joins a room via websocket connection', async () => {
		const { port } = app.server.address() as AddressInfo;

		const wsUrl = `ws://localhost:${port}`;

		// 1. Create a room via API
		const createResponse = await request(app.server).post('/rooms');
		const { roomId } = createResponse.body;
		const client = new WebSocket(wsUrl);

		const receivedMessage = await new Promise<{
			type: string;
			payload: unknown;
		}>((resolve, reject) => {
			client.on('open', () => {
				client.send(
					JSON.stringify({
						type: SocketActionEnum.JOIN_ROOM,
						payload: { roomId, username: 'test-user' },
					}),
				);
			});

			client.on('message', (data) => {
				const msg = JSON.parse(data.toString());
				if (msg.type === SocketEventEnum.ROOM_STATE) {
					resolve(msg);
					client.close();
				}
			});

			client.on('error', (err) => {
				reject(err);
			});
		});

		expect(receivedMessage.type).toBe(SocketEventEnum.ROOM_STATE);

		const payload = receivedMessage.payload as {
			id: string;
			participants: { username: string }[];
		};

		expect(payload.id).toBe(roomId);
		expect(payload.participants[0]!.username).toBe('test-user');
	});
});
