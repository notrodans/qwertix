import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		environment: 'node',
		globals: true,
		include: ['tests/**/*.spec.ts'],
		exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**/*'],
	},
});
