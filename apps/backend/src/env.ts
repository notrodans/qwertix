import { createEnv } from '@t3-oss/env-core';
import { config } from 'dotenv';
import path from 'path';
import { z } from 'zod';

config({
	path: path.resolve(__dirname, '../../../.env'),
});

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(['development', 'test', 'production'])
			.default('development'),
		PORT: z.coerce.number(),
		DB_HOST: z.string(),
		DB_PORT: z.coerce.number(),
		DB_USER: z.string(),
		DB_PASSWORD: z.string(),
		DB_NAME: z.string(),
		JWT_SECRET: z.string(),
		RESULT_HASH_SALT: z.string(),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
