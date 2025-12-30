import { useSessionStore } from '@/entities/session';

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
		const res = await fetch(`/api/presets`);
		if (!res.ok) throw new Error('Failed to fetch presets');
		return res.json();
	},

	createPreset: async (name: string, config: RoomConfig): Promise<Preset> => {
		const token = useSessionStore.getState().token;
		const res = await fetch(`/api/presets`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ name, config }),
		});
		if (!res.ok) throw new Error('Failed to create preset');
		return res.json();
	},
};
