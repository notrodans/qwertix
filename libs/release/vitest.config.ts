import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		globals: true,
		environment: 'node',
		include: ['src/**/*.spec.ts'],
		setupFiles: ['./src/tests/setup.ts'],
		alias: {
			bun: path.resolve(__dirname, './src/__mocks__/bun.ts'),
		},
	},
});
