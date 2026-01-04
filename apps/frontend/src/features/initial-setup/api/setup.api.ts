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
		id: number;
		username: string;
		email: string;
		role: string;
	};
	message: string;
}

export const setupApi = {
	checkStatus: async (): Promise<SetupStatusResponse> => {
		const res = await fetch('/api/auth/setup-status');
		if (!res.ok) throw new Error('Failed to check setup status');
		return res.json();
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
