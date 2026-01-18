import { action, wrap } from '@reatom/core';
import { navigate } from '@/shared/model';

export const createRoom = action(async () => {
	try {
		const res = await wrap(fetch('/api/rooms', { method: 'POST' }));
		if (res.ok) {
			const { roomId } = await wrap(res.json());
			navigate(`/room/${roomId}`);
		}
	} catch (e) {
		console.error('Failed to create room', e);
	}
}, 'home.createRoom');
