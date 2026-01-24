import { action, atom, computed, withLocalStorage } from '@reatom/core';
import type { User } from '../api/auth.api';

export const tokenAtom = atom<string | null>(null, 'session.token').extend(
	withLocalStorage('session.token'),
);

export const userAtom = atom<User | null>(null, 'session.user').extend(
	withLocalStorage('session.user'),
);
export const isAuthenticatedAtom = computed(
	() => !!tokenAtom(),
	'session.isAuthenticated',
);

export const setSession = action((token: string, user: User) => {
	tokenAtom.set(token);
	userAtom.set(user);
}, 'session.setSession');

export const logout = action(() => {
	tokenAtom.set(null);
	userAtom.set(null);
}, 'session.logout');
