import { bindField, reatomComponent } from '@reatom/react';
import { setupForm } from '../model/setup-form';

export const SetupForm = reatomComponent(() => {
	const { fields, submit } = setupForm;

	return (
		<div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md border border-gray-200">
			<div className="text-center">
				<h1 className="text-2xl font-bold text-gray-900">Welcome to Qwertix</h1>
				<p className="mt-2 text-sm text-gray-600">
					Create the administrator account to get started.
				</p>
			</div>

			<form onSubmit={submit} className="space-y-4">
				{submit.error() && (
					<div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
						{submit.error()?.message}
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
						type="text"
						className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						{...bindField(fields.username)}
					/>
					{fields.username.validation().error && (
						<span className="text-xs text-red-500">
							{fields.username.validation().error}
						</span>
					)}
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
						type="email"
						className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						{...bindField(fields.email)}
					/>
					{fields.email.validation().error && (
						<span className="text-xs text-red-500">
							{fields.email.validation().error}
						</span>
					)}
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
						type="password"
						className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						{...bindField(fields.password)}
					/>
					{fields.password.validation().error && (
						<span className="text-xs text-red-500">
							{fields.password.validation().error}
						</span>
					)}
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
						type="password"
						className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						{...bindField(fields.confirmPassword)}
					/>
					{fields.confirmPassword.validation().error && (
						<span className="text-xs text-red-500">
							{fields.confirmPassword.validation().error}
						</span>
					)}
				</div>

				<button
					type="submit"
					disabled={!submit.ready()}
					className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
				>
					{!submit.ready() ? 'Creating...' : 'Create Administrator'}
				</button>
			</form>
		</div>
	);
});
