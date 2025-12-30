import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app';

describe('Backend E2E', () => {
	beforeAll(async () => {
		await app.ready();
		await app.listen({ port: 0 });
	});

	afterAll(async () => {
		await app.close();
	});

	it('responds with status ok on health check endpoint', async () => {
		const response = await request(app.server).get('/health');
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('status', 'ok');
	});
});
