import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authApi, setSession } from '@/entities/session';
import { homeRoute } from '@/shared/model';
import { loginFormFactory } from './login-form';

// Mock dependencies
vi.mock('@/entities/session', () => ({
	authApi: {
		login: vi.fn(),
	},
	setSession: vi.fn(),
}));

vi.mock('@/shared/model', () => ({
	homeRoute: {
		go: vi.fn(),
	},
}));

// Mock reatomForm to expose the config
vi.mock('@reatom/core', async () => {
	const actual = await vi.importActual('@reatom/core');
	const mockReatomForm = vi.fn((initial, config) => ({
		...initial,
		config,
	}));
	return {
		...actual,
		reatomForm: mockReatomForm,
	};
});

describe('login-form', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should submit form, set session and redirect on success', async () => {
		const mockUser = { id: '1', username: 'test', email: 'test@test.com' };
		const mockToken = 'token123';

		// Mock authApi.login success
		// biome-ignore lint/suspicious/noExplicitAny: mock
		(authApi.login as any).mockResolvedValue({
			user: mockUser,
			token: mockToken,
		});

		const formAtom = loginFormFactory();

		// Access the captured config from the mock
		// @ts-ignore
		const config = formAtom.config;

		expect(config).toBeDefined();
		expect(config.onSubmit).toBeDefined();

		// Invoke onSubmit
		await config.onSubmit({ email: 'test@test.com', password: 'password' });

		expect(authApi.login).toHaveBeenCalledWith('test@test.com', 'password');
		expect(setSession).toHaveBeenCalledWith(mockToken, mockUser);
		expect(homeRoute.go).toHaveBeenCalled();
	});
});
