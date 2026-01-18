import { reatomForm, wrap } from '@reatom/core';
import z from 'zod';
import { loginRoute } from '@/shared/model';
import { setupApi } from '../api/setup.api';
import { setupRequired } from './setup-model';

export const setupFormFactory = () =>
	reatomForm(
		{
			username: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
		{
			name: 'setupForm',
			schema: z
				.object({
					username: z.string().min(1, 'Username is required'),
					email: z.email('Invalid email').min(1, 'Email is required'),
					password: z.string().min(1, 'Password is required'),
					confirmPassword: z.string().min(1, 'Confirm Password is required'),
				})
				.refine((data) => data.password === data.confirmPassword, {
					message: 'Passwords do not match',
					path: ['confirmPassword'],
				}),
			onSubmit: async (values) => {
				await wrap(setupApi.createSuperuser(values));
				setupRequired.set(false);
				loginRoute.go();
			},
		},
	);
