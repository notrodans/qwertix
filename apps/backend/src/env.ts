import { createEnv } from '@t3-oss/env-core';
import { config } from 'dotenv';
import path from 'path';
import { z } from 'zod';
import { getEnv } from './utils/get-env';

// Load .env from project root for local development
config({ path: path.resolve(__dirname, '../../../.env') });

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(['development', 'test', 'production'])
			.default('development'),
		DATABASE_URL: z.string().url(),
		JWT_SECRET: z.string(),
		RESULT_HASH_SALT: z.string(),
	},
	runtimeEnv: {
		NODE_ENV: getEnv('NODE_ENV'),
		DATABASE_URL: getEnv('DATABASE_URL'),
		JWT_SECRET: getEnv('JWT_SECRET'),
		RESULT_HASH_SALT: getEnv('RESULT_HASH_SALT'),
	},
	emptyStringAsUndefined: true,
});
