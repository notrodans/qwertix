import { UserRoleEnum } from '@qwertix/room-contracts';
import { reatomComponent } from '@reatom/react';
import { Fragment } from 'react/jsx-runtime';
import { userAtom } from '@/entities/session';
import { CreateUserForm } from '@/features/create-user';

const AdminPage = reatomComponent(() => {
	const user = userAtom();

	if (!user || user.role !== UserRoleEnum.ADMIN) {
		return <Fragment />;
	}

	return (
		<div className="container mx-auto py-10 px-4">
			<h1 className="text-3xl font-bold mb-8 text-primary">Admin Dashboard</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div className="bg-card p-6 rounded-lg border border-border">
					<h2 className="text-xl font-semibold mb-4 text-foreground">
						Create New User
					</h2>
					<CreateUserForm />
				</div>
			</div>
		</div>
	);
});

export default AdminPage;
