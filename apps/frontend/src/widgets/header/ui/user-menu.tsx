import { reatomComponent } from '@reatom/react';
import { isAuthenticatedAtom, logout, userAtom } from '@/entities/session';
import { Link } from '@/shared/ui/link';

export const UserMenu = reatomComponent(() => {
	const user = userAtom();
	const isAuthenticated = isAuthenticatedAtom();

	if (!isAuthenticated) {
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
});
