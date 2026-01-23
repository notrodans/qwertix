import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';
import { getEnv } from './utils/get-env';

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
	runtimeEnv: {
		NODE_ENV: getEnv('NODE_ENV'),
		PORT: getEnv('PORT'),
		DB_HOST: getEnv('DB_HOST'),
		DB_PORT: getEnv('DB_PORT'),
		DB_USER: getEnv('DB_USER'),
		DB_PASSWORD: getEnv('DB_PASSWORD'),
		DB_NAME: getEnv('DB_NAME'),
		JWT_SECRET: getEnv('JWT_SECRET'),
		RESULT_HASH_SALT: getEnv('RESULT_HASH_SALT'),
	},
	emptyStringAsUndefined: true,
});