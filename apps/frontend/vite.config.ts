import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), tsconfigPaths(), tailwindcss()],
	envDir: path.resolve(__dirname, '../../'),
	server: {
		host: '0.0.0.0',
		// proxy: {
		// 	'/api': {
		// 		target: env.VITE_API_URL,
		// 		changeOrigin: true,
		// 		rewrite: (path) => path.replace(/^\/api/, ''),
		// 	},
		// },
	},
});
