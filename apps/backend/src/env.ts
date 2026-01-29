import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(['development', 'test', 'production'])
			.default('development'),
		DATABASE_URL: z.url(),
		JWT_SECRET: z.string(),
		RESULT_HASH_SALT: z.string(),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
