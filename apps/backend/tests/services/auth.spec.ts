import bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataBase } from '../../src/db';
import { AuthService } from '../../src/services/auth.service';

const { mockSelect, mockInsert, mockExecute } = vi.hoisted(() => {
	const mockExecute = vi.fn();
	const mockReturning = vi.fn(() => ({ execute: mockExecute }));
	const mockValues = vi.fn(() => ({ returning: mockReturning }));
	const mockFrom = vi.fn(() => ({
		where: vi.fn(() => ({ execute: mockExecute })),
	}));
	const mockSelect = vi.fn(() => ({ from: mockFrom }));
	const mockInsert = vi.fn(() => ({ values: mockValues }));

	return {
		mockSelect,
		mockInsert,
		mockExecute,
	};
});

describe('AuthService', () => {
	let authService: AuthService;
	let mockDb: DataBase;

	beforeEach(() => {
		mockDb = {
			source: {
				select: mockSelect,
				insert: mockInsert,
			} as unknown as DataBase['source'],
		} as DataBase;
		authService = new AuthService(mockDb);
		vi.clearAllMocks();
	});

	it('should validate user with correct password', async () => {
		const password = 'password123';
		const hash = await bcrypt.hash(password, 10);
		const mockUser = { id: 1, email: 'test@example.com', passwordHash: hash };

		mockExecute.mockResolvedValue([mockUser]);

		const result = await authService.validateLocalUser(
			'test@example.com',
			password,
		);

		expect(result).toEqual(mockUser);
	});

	it('should return null for incorrect password', async () => {
		const hash = await bcrypt.hash('correct_password', 10);
		const mockUser = { id: 1, email: 'test@example.com', passwordHash: hash };

		mockExecute.mockResolvedValue([mockUser]);

		const result = await authService.validateLocalUser(
			'test@example.com',
			'wrong_password',
		);

		expect(result).toBeNull();
	});

	it('should create a new user with hashed password', async () => {
		const mockUser = {
			id: 1,
			email: 'new@example.com',
			username: 'newuser',
			role: 'user',
		};
		mockExecute.mockResolvedValue([mockUser]);

		const result = await authService.createUser(
			'new@example.com',
			'newuser',
			'password',
			'user',
		);

		expect(mockInsert).toHaveBeenCalled();
		expect(result).toEqual(mockUser);
	});

	it('should create an admin user when specified', async () => {
		const mockAdmin = { id: 2, email: 'admin@example.com', role: 'admin' };
		mockExecute.mockResolvedValue([mockAdmin]);

		const result = await authService.createUser(
			'admin@example.com',
			'admin',
			'password',
			'admin',
		);

		expect(result.role).toBe('admin');
	});
});
