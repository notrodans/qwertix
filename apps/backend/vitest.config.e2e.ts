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
			PORT: '3000',
			DB_HOST: 'localhost',
			DB_PORT: '5433',
			DB_USER: 'postgres',
			DB_PASSWORD: 'postgres',
			DB_NAME: 'qwertix_test',
			JWT_SECRET: 'test_secret',
			RESULT_HASH_SALT: 'test_salt',
			NODE_ENV: 'test',
		},
	},
});
