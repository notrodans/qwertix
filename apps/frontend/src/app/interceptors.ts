import { UserRoleEnum } from '@qwertix/room-contracts';
import { effect } from '@reatom/core';
import { userAtom } from '@/entities/session';
import {
	adminRoute,
	homeRoute,
	setupRequired,
	setupRoute,
} from '@/shared/model';

effect(() => {
	const user = userAtom();
	if (adminRoute()) {
		const isAdmin = user?.role === UserRoleEnum.ADMIN;
		if (!isAdmin) {
			homeRoute.go();
		}
	}

	if (setupRoute()) {
		if (setupRequired()) {
			setupRoute.go();
		} else {
			homeRoute.go();
		}
	}
}, 'pages.guard');
