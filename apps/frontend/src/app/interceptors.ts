import { UserRoleEnum } from '@qwertix/room-contracts';
import { effect } from '@reatom/core';
import { userAtom } from '@/entities/session';
import { adminRoute, homeRoute } from './routes';

effect(() => {
	if (adminRoute()) {
		const user = userAtom();
		const isAdmin = user?.role === UserRoleEnum.ADMIN;
		if (!isAdmin) {
			homeRoute.go();
		}
	}
});
