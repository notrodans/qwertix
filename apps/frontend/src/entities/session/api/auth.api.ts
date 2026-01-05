export interface User {
	id: string;
	username: string;
	email: string;
	role: 'admin' | 'user';
	avatarUrl?: string;
}

export interface AuthResponse {
	token: string;
	user: User;
}

export const authApi = {
	login: async (email: string, password: string): Promise<AuthResponse> => {
		const res = await fetch(`/api/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password }),
		});
		if (!res.ok) throw new Error('Login failed');
		return res.json();
	},

	// Helper to get headers with token
	authHeader: (token: string) => ({
		Authorization: `Bearer ${token}`,
	}),
};
