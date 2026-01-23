import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		environment: 'node',
		globals: true,
		include: ['tests/**/*.spec.ts'],
		exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**/*'],
		env: {
			DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
			JWT_SECRET: 'test_secret',
			RESULT_HASH_SALT: 'test_salt',
			NODE_ENV: 'test',
		},
	},
});
