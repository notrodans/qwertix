import { reatomForm, wrap } from '@reatom/core';
import { z } from 'zod';
import { navigate } from '@/shared/model';
import { setupApi } from '../api/setup.api';

export const setupForm = reatomForm(
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
			const { username, email, password } = values;
			await wrap(
				setupApi.createSuperuser({
					username,
					email,
					password,
				}),
			);
			navigate('/login');
		},
	},
);
