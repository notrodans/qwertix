import { vi } from 'vitest';

// @ts-ignore
globalThis.Bun = {
	// @ts-ignore
	file: (path: string | URL) => ({
		json: () => Promise.resolve({ version: '1.2.3' }),
	}),
	write: vi.fn(),
	// @ts-ignore
	$: vi.fn(),
};
