import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './tests/setup.ts',
		exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
		env: {
			VITE_API_URL: 'http://localhost:3000',
			VITE_WS_URL: 'ws://localhost:3000',
			VITE_RESULT_HASH_SALT: 'test_salt',
		},
	},
});
