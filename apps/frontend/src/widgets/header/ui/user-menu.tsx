import { reatomComponent } from '@reatom/react';
import { isAuthenticatedAtom, logout, userAtom } from '@/entities/session';
import { Link } from '@/shared/ui/link';

export const UserMenu = reatomComponent(() => {
	const user = userAtom();
	const isAuthenticated = isAuthenticatedAtom();

	if (!isAuthenticated) {
		return (
			<div className="flex gap-4">
				<Link
					to="/login"
					className="text-muted-foreground hover:text-foreground"
				>
					Login
				</Link>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-4">
			<Link
				to="/profile"
				className="text-muted-foreground hover:text-foreground"
			>
				{user?.username}
			</Link>
			<button
				onClick={logout}
				className="text-destructive hover:text-destructive/80 text-sm"
			>
				Logout
			</button>
		</div>
	);
});
