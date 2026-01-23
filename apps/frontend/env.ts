import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
	clientPrefix: 'VITE_',
	client: {
		VITE_API_URL: z.url(),
		VITE_WS_URL: z.url(),
		VITE_RESULT_HASH_SALT: z.string(),
	},
	runtimeEnv: typeof import.meta.env !== 'undefined' ? import.meta.env : process.env,
	emptyStringAsUndefined: true,
});