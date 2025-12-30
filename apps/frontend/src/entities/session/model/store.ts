import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../api/auth.api';

interface SessionState {
	token: string | null;
	user: User | null;
	setSession: (token: string, user: User) => void;
	logout: () => void;
	isAuthenticated: () => boolean;
}

export const useSessionStore = create<SessionState>()(
	persist(
		(set, get) => ({
			token: null,
			user: null,
			setSession: (token, user) => set({ token, user }),
			logout: () => set({ token: null, user: null }),
			isAuthenticated: () => !!get().token,
		}),
		{
			name: 'session-storage',
		},
	),
);
