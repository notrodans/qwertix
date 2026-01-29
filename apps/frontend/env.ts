import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

const resolveUrl = (val: unknown) => {
	if (
		typeof window !== 'undefined' &&
		typeof val === 'string' &&
		val.startsWith('/')
	) {
		return `${window.location.origin}${val}`;
	}
	return val;
};

const resolveWsUrl = (val: unknown) => {
	if (
		typeof window !== 'undefined' &&
		typeof val === 'string' &&
		val.startsWith('/')
	) {
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		return `${protocol}//${window.location.host}${val}`;
	}
	return val;
};

export const env = createEnv({
	clientPrefix: 'VITE_',
	client: {
		VITE_API_URL: z.preprocess(resolveUrl, z.url()),
		VITE_WS_URL: z.preprocess(resolveWsUrl, z.url()),
		VITE_RESULT_HASH_SALT: z.string(),
	},
	runtimeEnv: {
		VITE_API_URL:
			(globalThis as unknown as { _env_?: Record<string, string> })._env_
				?.VITE_API_URL ?? import.meta.env.VITE_API_URL,
		VITE_WS_URL:
			(globalThis as unknown as { _env_?: Record<string, string> })._env_
				?.VITE_WS_URL ?? import.meta.env.VITE_WS_URL,
		VITE_RESULT_HASH_SALT:
			(globalThis as unknown as { _env_?: Record<string, string> })._env_
				?.VITE_RESULT_HASH_SALT ?? import.meta.env.VITE_RESULT_HASH_SALT,
	},
	emptyStringAsUndefined: true,
});
