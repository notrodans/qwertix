import { useSessionStore } from '@/entities/session';

interface CreateUserParams {
	email: string;
	username: string;
	password: string;
	role: 'admin' | 'user';
}

export const createUserApi = async (params: CreateUserParams) => {
	const token = useSessionStore.getState().token;

	const res = await fetch('/api/admin/users', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(params),
	});

	if (!res.ok) {
		const error = await res.json();
		throw new Error(error.message || 'Failed to create user');
	}

	return res.json();
};
