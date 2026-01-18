import { effect } from '@reatom/core';
import { fetchUserResults } from '@/entities/result';
import { userAtom } from '@/entities/session';

effect(() => {
	const user = userAtom();
	if (user) fetchUserResults(user.id);
});
