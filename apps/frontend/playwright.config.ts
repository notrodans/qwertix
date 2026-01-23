import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.SITE_BASE_URL || 'http://localhost:5173';

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [['html', { open: 'never' }]],
	use: {
		baseURL,
		trace: 'on-first-retry',
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],
	webServer: {
		command: 'NODE_ENV=test bun run dev',
		url: baseURL,
		reuseExistingServer: !process.env.CI,
		stdout: 'ignore',
		stderr: 'pipe',
		env: {
			VITE_API_URL: 'http://localhost:3000',
			VITE_WS_URL: 'ws://localhost:3000',
			VITE_RESULT_HASH_SALT: 'test_salt',
		},
	},
});
