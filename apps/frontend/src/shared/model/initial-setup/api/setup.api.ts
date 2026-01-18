import { UserRoleEnum } from '@qwertix/room-contracts';
import { wrap } from '@reatom/core';

export interface SetupStatusResponse {
	isSetupRequired: boolean;
}

export interface SetupPayload {
	username: string;
	email: string;
	password: string;
}

export interface SetupResponse {
	user: {
		id: string;
		username: string;
		email: string;
		role: UserRoleEnum;
	};
	message: string;
}

export const setupApi = {
	checkStatus: async (): Promise<SetupStatusResponse> => {
		const res = await wrap(fetch('/api/auth/setup-status'));
		if (!res.ok) throw new Error('Failed to check setup status');
		return wrap(res.json());
	},

	createSuperuser: async (payload: SetupPayload): Promise<SetupResponse> => {
		const res = await fetch('/api/auth/setup', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});

		if (!res.ok) {
			const error = await res.json();
			throw new Error(error.message || 'Setup failed');
		}

		return res.json();
	},
};
