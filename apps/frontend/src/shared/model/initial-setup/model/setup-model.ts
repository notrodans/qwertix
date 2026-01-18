import {
	action,
	atom,
	withAsyncData,
	withConnectHook,
	wrap,
} from '@reatom/core';
import { setupApi } from '../api/setup.api';

export const setupRequired = atom<boolean>(false, 'setup.required');

export const fetchSetupStatus = action(async () => {
	const status = await wrap(setupApi.checkStatus());
	setupRequired.set(status.isSetupRequired);
}, 'setup.fetchStatus').extend(withAsyncData());

fetchSetupStatus.data.extend(
	withConnectHook(() => {
		fetchSetupStatus();
	}),
);
