import { UserRoleEnum } from '@qwertix/room-contracts';
import { beforeEach, describe, expect, it } from 'vitest';
import {
	isAuthenticatedAtom,
	logout,
	setSession,
	tokenAtom,
	userAtom,
} from './store';

describe('session store', () => {
	beforeEach(() => {
		localStorage.clear();
		logout(); // Reset global state
	});

	it('should start with empty state', () => {
		expect(tokenAtom()).toBeNull();
		expect(userAtom()).toBeNull();
		expect(isAuthenticatedAtom()).toBe(false);
	});

	it('should set session', () => {
		const user = {
			id: '1',
			username: 'testuser',
			email: 'test@example.com',
			role: UserRoleEnum.USER,
		};
		const token = 'fake-token';

		setSession(token, user);

		expect(tokenAtom()).toBe(token);
		expect(userAtom()).toEqual(user);
		expect(isAuthenticatedAtom()).toBe(true);
	});

	it('should logout', () => {
		setSession('token', {
			id: '1',
			username: 'u',
			email: 'e',
			role: UserRoleEnum.USER,
		});
		logout();

		expect(tokenAtom()).toBeNull();
		expect(userAtom()).toBeNull();
	});
});
