import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	// Load env file from the root directory
	const env = loadEnv(mode, path.resolve(__dirname, '../../'), '');

	const apiTarget =
		env.VITE_API_URL && env.VITE_API_URL.startsWith('http')
			? env.VITE_API_URL
			: 'http://127.0.0.1:3009';

	return {
		plugins: [react(), tsconfigPaths(), tailwindcss()],
		envDir: path.resolve(__dirname, '../../'),
		server: {
			host: '0.0.0.0',
			port: 3006,
			proxy: {
				'/api': {
					target: apiTarget,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, ''),
					secure: false,
					ws: true,
					configure: (proxy) => {
						proxy.on('error', (err) => {
							console.error('proxy error', err);
						});
					},
				},
			},
		},
		preview: {
			host: '0.0.0.0',
			port: 3006,
		},
	};
});
