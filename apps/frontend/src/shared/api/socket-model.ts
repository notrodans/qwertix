import { atom, withConnectHook } from '@reatom/core';
import { env } from '../../../env';
import { socketService } from './socket';

export const socketConnectionAtom = atom(null, 'socketConnection');

socketConnectionAtom.extend(
	withConnectHook(() => {
		socketService.connect(env.VITE_WS_URL);
		return () => socketService.disconnect();
	}),
);
