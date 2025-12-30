import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, useSessionStore } from '@/entities/session';

export function RegisterPage() {
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const setSession = useSessionStore((s) => s.setSession);
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const { token, user } = await authApi.register(username, email, password);
			setSession(token, user);
			navigate('/');
		} catch {
			setError('Registration failed. Try again.');
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-200">
			<div className="w-full max-w-md p-8 space-y-6 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800">
				<h1 className="text-2xl font-bold text-center text-emerald-400">
					Join Qwertix
				</h1>
				{error && <div className="text-red-500 text-center">{error}</div>}
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium">Username</label>
						<input
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="w-full px-4 py-2 mt-1 bg-zinc-800 border border-zinc-700 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-medium">Email</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full px-4 py-2 mt-1 bg-zinc-800 border border-zinc-700 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-medium">Password</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-4 py-2 mt-1 bg-zinc-800 border border-zinc-700 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
							required
						/>
					</div>
					<button
						type="submit"
						className="w-full py-2 font-bold text-zinc-950 bg-emerald-400 rounded-md hover:bg-emerald-300 transition-colors"
					>
						Register
					</button>
				</form>
				<div className="text-center text-sm text-zinc-500">
					Already have an account?{' '}
					<a href="/login" className="text-emerald-400 hover:underline">
						Login
					</a>
				</div>
			</div>
		</div>
	);
}
