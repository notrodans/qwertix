import { UserRoleEnum } from '@qwertix/room-contracts';
import { reatomComponent } from '@reatom/react';
import { userAtom } from '@/entities/session';
import { CreateUserForm } from '@/features/create-user';

const AdminPage = reatomComponent(() => {
	const user = userAtom();

	if (!user || user.role !== UserRoleEnum.ADMIN) {
		return <></>;
	}

	return (
		<div className="container mx-auto py-10 px-4">
			<h1 className="text-3xl font-bold mb-8 text-emerald-400">
				Admin Dashboard
			</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
					<h2 className="text-xl font-semibold mb-4 text-zinc-200">
						Create New User
					</h2>
					<CreateUserForm />
				</div>
			</div>
		</div>
	);
});

const Component = AdminPage;
export default Component;
