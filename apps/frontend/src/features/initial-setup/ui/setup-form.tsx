import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateSuperuser } from '../model/use-create-superuser';

export function SetupForm() {
	const navigate = useNavigate();
	const { mutate: createSuperuser, isPending, error } = useCreateSuperuser();
	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
		confirmPassword: '',
	});
	const [validationError, setValidationError] = useState<string | null>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
		setValidationError(null);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (formData.password !== formData.confirmPassword) {
			setValidationError('Passwords do not match');
			return;
		}

		createSuperuser(
			{
				username: formData.username,
				email: formData.email,
				password: formData.password,
			},
			{
				onSuccess: () => {
					// Redirect to login or home
					navigate('/login');
				},
			},
		);
	};

	return (
		<div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md border border-gray-200">
			<div className="text-center">
				<h1 className="text-2xl font-bold text-gray-900">Welcome to Qwertix</h1>
				<p className="mt-2 text-sm text-gray-600">
					Create the administrator account to get started.
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				{validationError && (
					<div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
						{validationError}
					</div>
				)}
				{error && (
					<div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
						{error.message}
					</div>
				)}

				<div>
					<label
						htmlFor="username"
						className="block text-sm font-medium text-gray-700"
					>
						Username
					</label>
					<input
						id="username"
						name="username"
						type="text"
						required
						value={formData.username}
						onChange={handleChange}
						className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label
						htmlFor="email"
						className="block text-sm font-medium text-gray-700"
					>
						Email
					</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						value={formData.email}
						onChange={handleChange}
						className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label
						htmlFor="password"
						className="block text-sm font-medium text-gray-700"
					>
						Password
					</label>
					<input
						id="password"
						name="password"
						type="password"
						required
						value={formData.password}
						onChange={handleChange}
						className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label
						htmlFor="confirmPassword"
						className="block text-sm font-medium text-gray-700"
					>
						Confirm Password
					</label>
					<input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						required
						value={formData.confirmPassword}
						onChange={handleChange}
						className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<button
					type="submit"
					disabled={isPending}
					className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
				>
					{isPending ? 'Creating...' : 'Create Administrator'}
				</button>
			</form>
		</div>
	);
}
