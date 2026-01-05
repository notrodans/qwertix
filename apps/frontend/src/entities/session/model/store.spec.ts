import { beforeEach, describe, expect, it } from 'vitest';
import { useSessionStore } from './store';

describe('useSessionStore', () => {
	beforeEach(() => {
		useSessionStore.getState().logout();
	});

	it('should start with empty state', () => {
		const state = useSessionStore.getState();
		expect(state.token).toBeNull();
		expect(state.user).toBeNull();
		expect(state.isAuthenticated()).toBe(false);
	});

	it('should set session', () => {
		const user = {
			id: '1',
			username: 'testuser',
			email: 'test@example.com',
			role: 'user' as const,
		};
		const token = 'fake-token';

		useSessionStore.getState().setSession(token, user);

		const state = useSessionStore.getState();
		expect(state.token).toBe(token);
		expect(state.user).toEqual(user);
		expect(state.isAuthenticated()).toBe(true);
	});

	it('should logout', () => {
		useSessionStore.getState().setSession('token', {
			id: '1',
			username: 'u',
			email: 'e',
			role: 'user',
		});
		useSessionStore.getState().logout();

		const state = useSessionStore.getState();
		expect(state.token).toBeNull();
		expect(state.user).toBeNull();
	});
});
