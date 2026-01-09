import { UserRoleEnum } from '@qwertix/room-contracts';
import { wrap } from '@reatom/core';
import { tokenAtom } from '@/entities/session';

interface CreateUserParams {
	email: string;
	username: string;
	password: string;
	role: UserRoleEnum;
}

export const createUserApi = async (params: CreateUserParams) => {
	const token = tokenAtom();

	const res = await wrap(
		fetch('/api/admin/users', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(params),
		}),
	);

	if (!res.ok) {
		const error = await wrap(res.json());
		throw new Error(error.message || 'Failed to create user');
	}

	return wrap(res.json());
};
