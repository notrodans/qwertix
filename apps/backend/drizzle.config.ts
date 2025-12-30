import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import { env } from './src/env';

config();

export default defineConfig({
	schema: './src/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		host: env.DB_HOST,
		user: env.DB_USER,
		password: env.DB_PASSWORD,
		database: env.DB_NAME,
		port: env.DB_PORT,
		ssl: false,
	},
});
