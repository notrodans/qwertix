import { Link } from 'react-router-dom';
import { useSessionStore } from '@/entities/session';

export function UserMenu() {
	const { user, logout, isAuthenticated } = useSessionStore();

	if (!isAuthenticated()) {
		return (
			<div className="flex gap-4">
				<Link to="/login" className="text-zinc-400 hover:text-white">
					Login
				</Link>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-4">
			<Link to="/profile" className="text-zinc-300 hover:text-white">
				{user?.username}
			</Link>
			<button
				onClick={logout}
				className="text-red-400 hover:text-red-300 text-sm"
			>
				Logout
			</button>
		</div>
	);
}
