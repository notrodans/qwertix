import request from 'supertest';
import { v4 as uuid } from 'uuid';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app';

describe('Auth E2E', () => {
	beforeAll(async () => {
		await app.ready();
		await app.listen({ port: 0 });
	});

	afterAll(async () => {
		await app.close();
	});

	const testUser = {
		email: `test-${uuid()}@example.com`,
		username: 'testuser',
		password: 'password123',
	};

	it('should create a new user via admin endpoint', async () => {
		const response = await request(app.server).post('/users').send(testUser);

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('email', testUser.email);
	});

	it('should login with existing user', async () => {
		const response = await request(app.server)
			.post('/auth/login')
			.send({ email: testUser.email, password: testUser.password });

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('token');
	});

	it('should fail login with wrong password', async () => {
		const response = await request(app.server)
			.post('/auth/login')
			.send({ email: testUser.email, password: 'wrongpassword' });

		expect(response.status).toBe(401);
	});
});
