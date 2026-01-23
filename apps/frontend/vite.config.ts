import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	// Load env file from the root directory
	const env = loadEnv(mode, path.resolve(__dirname, '../../'));

	return {
		plugins: [react(), tsconfigPaths(), tailwindcss()],
		envDir: path.resolve(__dirname, '../../'),
		server: {
			host: '0.0.0.0',
			port: 3006,
			proxy: {
				'/api': {
					target: env.VITE_API_URL || 'http://localhost:3009',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, ''),
				},
			},
		},
		preview: {
			host: '0.0.0.0',
			port: 3006,
		},
	};
});
