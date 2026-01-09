import { action, withAsyncData, withConnectHook, wrap } from '@reatom/core';
import { setupApi } from '../api/setup.api';

export const fetchSetupStatus = action(async () => {
	return await wrap(setupApi.checkStatus());
}, 'setup.fetchStatus').extend(withAsyncData());

fetchSetupStatus.data.extend(
	withConnectHook(() => {
		fetchSetupStatus();
	}),
);
