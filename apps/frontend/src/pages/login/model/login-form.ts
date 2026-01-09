import { reatomForm, wrap } from '@reatom/core';
import { z } from 'zod';
import { authApi, setSession } from '@/entities/session';
import { navigate } from '@/shared/model';

export const loginForm = reatomForm(
	{
		email: '',
		password: '',
	},
	{
		name: 'loginForm',
		schema: z.object({
			email: z.email('Invalid email').nonempty('Email is required'),
			password: z.string().min(1, 'Password is required'),
		}),
		onSubmit: async (values) => {
			const { token, user } = await wrap(
				authApi.login(values.email, values.password),
			);
			setSession(token, user);
			navigate('/');
		},
	},
);
