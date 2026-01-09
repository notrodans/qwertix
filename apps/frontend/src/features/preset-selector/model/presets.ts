import { action, withAsyncData, withConnectHook, wrap } from '@reatom/core';
import { type Preset, presetApi } from './api';

export const fetchPresets = action(async () => {
	return await wrap(presetApi.getPresets());
}, 'presets.fetch').extend(withAsyncData({ initState: [] as Preset[] }));

fetchPresets.data.extend(
	withConnectHook(() => {
		fetchPresets();
	}),
);
