import { Link } from '@/shared/ui/link';
import { UserMenu } from './user-menu';

export function Header() {
	return (
		<header className="w-full py-6 px-8 flex justify-between items-center bg-zinc-950 border-b border-zinc-900">
			<Link
				to="/"
				className="text-2xl font-bold text-emerald-500 font-mono tracking-tighter"
			>
				Qwertix
			</Link>
			<UserMenu />
		</header>
	);
}
