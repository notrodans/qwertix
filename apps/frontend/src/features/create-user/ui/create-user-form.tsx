import { useState } from 'react';
import { useCreateUser } from '../model/use-create-user';

export function CreateUserForm() {
	const {
		mutate: createUser,
		isPending,
		error,
		isSuccess,
		reset,
	} = useCreateUser();
	const [formData, setFormData] = useState({
		email: '',
		username: '',
		password: '',
		role: 'user' as 'admin' | 'user',
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		createUser(formData);
	};

	if (isSuccess) {
		return (
			<div className="p-4 bg-emerald-900/50 border border-emerald-500 rounded text-emerald-200">
				<p>User created successfully!</p>
				<button
					onClick={() => {
						reset();
						setFormData({
							email: '',
							username: '',
							password: '',
							role: 'user',
						});
					}}
					className="mt-3 px-4 py-2 bg-emerald-500 text-zinc-950 font-bold rounded hover:bg-emerald-400"
				>
					Create Another
				</button>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{error && (
				<div className="p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
					{error.message}
				</div>
			)}

			<div>
				<label className="block text-sm font-medium text-zinc-400">
					Username
				</label>
				<input
					type="text"
					value={formData.username}
					onChange={(e) =>
						setFormData({ ...formData, username: e.target.value })
					}
					className="w-full px-3 py-2 mt-1 bg-zinc-800 border border-zinc-700 rounded focus:ring-2 focus:ring-emerald-500 outline-none text-zinc-200"
					required
				/>
			</div>

			<div>
				<label className="block text-sm font-medium text-zinc-400">Email</label>
				<input
					type="email"
					value={formData.email}
					onChange={(e) => setFormData({ ...formData, email: e.target.value })}
					className="w-full px-3 py-2 mt-1 bg-zinc-800 border border-zinc-700 rounded focus:ring-2 focus:ring-emerald-500 outline-none text-zinc-200"
					required
				/>
			</div>

			<div>
				<label className="block text-sm font-medium text-zinc-400">
					Password
				</label>
				<input
					type="password"
					value={formData.password}
					onChange={(e) =>
						setFormData({ ...formData, password: e.target.value })
					}
					className="w-full px-3 py-2 mt-1 bg-zinc-800 border border-zinc-700 rounded focus:ring-2 focus:ring-emerald-500 outline-none text-zinc-200"
					required
					minLength={6}
				/>
			</div>

			<div>
				<label className="block text-sm font-medium text-zinc-400">Role</label>
				<select
					value={formData.role}
					onChange={(e) =>
						setFormData({
							...formData,
							role: e.target.value as 'user' | 'admin',
						})
					}
					className="w-full px-3 py-2 mt-1 bg-zinc-800 border border-zinc-700 rounded focus:ring-2 focus:ring-emerald-500 outline-none text-zinc-200"
				>
					<option value="user">User</option>
					<option value="admin">Admin</option>
				</select>
			</div>

			<button
				type="submit"
				disabled={isPending}
				className="w-full py-2 font-bold text-zinc-950 bg-emerald-400 rounded hover:bg-emerald-300 transition-colors disabled:opacity-50"
			>
				{isPending ? 'Creating...' : 'Create User'}
			</button>
		</form>
	);
}
