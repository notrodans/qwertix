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
	},
});
