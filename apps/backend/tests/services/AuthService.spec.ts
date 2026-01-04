import bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthService } from '../../src/services/AuthService';
import { FakeUserRepository } from '../fakes/FakeUserRepository';

describe('AuthService', () => {
	let authService: AuthService;
	let fakeRepo: FakeUserRepository;

	beforeEach(() => {
		fakeRepo = new FakeUserRepository();
		authService = new AuthService(fakeRepo);
	});

	it('should validate user with correct password', async () => {
		const password = 'password123';
		const hash = await bcrypt.hash(password, 10);
		await fakeRepo.create({
			email: 'test@example.com',
			username: 'test',
			passwordHash: hash,
		});

		const result = await authService.validateLocalUser(
			'test@example.com',
			password,
		);

		expect(result).toBeDefined();
		expect(result?.email).toBe('test@example.com');
	});

	it('should return null for incorrect password', async () => {
		const hash = await bcrypt.hash('correct_password', 10);
		await fakeRepo.create({
			email: 'test@example.com',
			username: 'test',
			passwordHash: hash,
		});

		const result = await authService.validateLocalUser(
			'test@example.com',
			'wrong_password',
		);

		expect(result).toBeNull();
	});

	it('should create a new user with hashed password', async () => {
		const _result = await authService.createUser(
			'new@example.com',
			'newuser',
			'password',
			'user',
		);

		const inRepo = await fakeRepo.findByEmail('new@example.com');
		expect(inRepo).toBeDefined();
		expect(inRepo?.username).toBe('newuser');
		expect(await bcrypt.compare('password', inRepo!.passwordHash)).toBe(true);
	});

	it('should return true if no users exist', async () => {
		const result = await authService.isSetupRequired();
		expect(result).toBe(true);
	});

	it('should return false if users exist', async () => {
		await fakeRepo.create({
			email: 'test@example.com',
			username: 'test',
			passwordHash: 'hash',
		});

		const result = await authService.isSetupRequired();
		expect(result).toBe(false);
	});
});
