import { vi } from 'vitest';

// biome-ignore lint/suspicious/noExplicitAny: mock
(globalThis as any).Bun = {
	file: (_path: string | URL) => ({
		json: () => Promise.resolve({ version: '1.2.3' }),
	}),
	write: vi.fn(),
	$: vi.fn(),
};
