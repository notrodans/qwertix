import { reatomComponent } from '@reatom/react';
import { userAtom } from '@/entities/session';
import { HistoryTable } from '@/features/profile-history';

const ProfilePage = reatomComponent(() => {
	const user = userAtom();

	if (!user) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="text-center">
					<h2 className="text-2xl font-bold mb-4">
						Please log in to view your profile
					</h2>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full space-y-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-zinc-100">
					{user.username}'s Profile
				</h1>
				<p className="text-zinc-500">{user.email}</p>
			</div>

			<div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
				<h2 className="text-xl font-semibold mb-4 text-zinc-200">
					Match History
				</h2>
				<HistoryTable userId={user.id} />
			</div>
		</div>
	);
});

const Component = ProfilePage;
export default Component;
