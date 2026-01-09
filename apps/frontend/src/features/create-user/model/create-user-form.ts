import { UserRoleEnum } from '@qwertix/room-contracts';
import { reatomForm, wrap } from '@reatom/core';
import { z } from 'zod';
import { createUserApi } from '../api/create-user.api';

export const createUserForm = reatomForm(
	{
		username: '',
		email: '',
		password: '',
		role: UserRoleEnum.USER as UserRoleEnum,
	},
	{
		name: 'createUserForm',
		schema: z.object({
			username: z.string().min(1, 'Username is required'),
			email: z.string().email('Invalid email').min(1, 'Email is required'),
			password: z.string().min(6, 'Password must be at least 6 chars'),
			role: z.nativeEnum(UserRoleEnum),
		}),
		onSubmit: async (values) => {
			await wrap(
				createUserApi({
					username: values.username,
					email: values.email,
					password: values.password,
					role: values.role,
				}),
			);
		},
		resetOnSubmit: true,
	},
);
