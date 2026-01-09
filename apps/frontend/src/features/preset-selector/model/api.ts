import { wrap } from '@reatom/core';
import { tokenAtom } from '@/entities/session';

export interface RoomConfig {
	mode: 'TIME' | 'WORDS';
	duration?: number;
	wordCount?: number;
}

export interface Preset {
	id: number;
	name: string;
	config: RoomConfig;
	isCustom: boolean;
}

export const presetApi = {
	getPresets: async (): Promise<Preset[]> => {
		const res = await wrap(fetch(`/api/presets`));
		if (!res.ok) throw new Error('Failed to fetch presets');
		return wrap(res.json());
	},

	createPreset: async (name: string, config: RoomConfig): Promise<Preset> => {
		const token = tokenAtom();
		const res = await wrap(
			fetch(`/api/presets`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ name, config }),
			}),
		);
		if (!res.ok) throw new Error('Failed to create preset');
		return wrap(res.json());
	},
};
