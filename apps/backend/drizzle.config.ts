import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config();

export default defineConfig({
	schema: './src/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		host: process.env.DB_HOST || 'localhost',
		user: process.env.DB_USER || 'postgres',
		password: process.env.DB_PASSWORD || 'postgres',
		database: process.env.DB_NAME || 'qwertix',
		port: parseInt(process.env.DB_PORT || '5432', 10),
		ssl: false,
	},
});
