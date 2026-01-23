import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		environment: 'node',
		globals: true,
		include: ['e2e/**/*.spec.ts'],
		globalSetup: ['./e2e/global-setup.ts'],
		setupFiles: ['./e2e/setup.ts'],
		fileParallelism: false,
		env: {
			DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/qwertix_test',
			JWT_SECRET: process.env.JWT_SECRET || 'test_secret',
			RESULT_HASH_SALT: process.env.RESULT_HASH_SALT || 'test_salt',
			NODE_ENV: process.env.NODE_ENV || 'test',
		},
	},
});
