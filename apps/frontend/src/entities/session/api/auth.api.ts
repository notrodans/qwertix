import { UserRoleEnum } from '@qwertix/room-contracts';
import { wrap } from '@reatom/core';

export interface User {
	id: string;
	username: string;
	email: string;
	role: UserRoleEnum;
	avatarUrl?: string;
}

export interface AuthResponse {
	token: string;
	user: User;
}

export const authApi = {
	login: async (email: string, password: string): Promise<AuthResponse> => {
		const res = await wrap(
			fetch(`/api/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			}),
		);
		if (!res.ok) throw new Error('Login failed');
		return wrap(res.json());
	},

	// Helper to get headers with token
	authHeader: (token: string) => ({
		Authorization: `Bearer ${token}`,
	}),
};
