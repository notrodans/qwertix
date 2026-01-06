import { createEnv } from '@t3-oss/env-core';
import { config } from 'dotenv';
import path from 'path';
import { z } from 'zod';

config({
	path: path.resolve(__dirname, '../../../.env'),
});

export const env = createEnv({
	server: {
		PORT: z.coerce.number().default(3000),
		DB_HOST: z.string().default('localhost'),
		DB_PORT: z.coerce.number().default(5432),
		DB_USER: z.string().default('postgres'),
		DB_PASSWORD: z.string().default('postgres'),
		DB_NAME: z.string().default('qwertix'),
		JWT_SECRET: z.string().default('supersecret'),
		RESULT_HASH_SALT: z.string().default('default_salt'),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
