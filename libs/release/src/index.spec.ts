import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReleaseManager } from './index';

/**
 * Mocking the executor ($) to capture commands
 */
function createMockExecutor() {
	const commands: string[] = [];
	// Mock the template literal call
	// biome-ignore lint/suspicious/noExplicitAny: complex mock
	const mockFunc: any = vi.fn(
		(strings: TemplateStringsArray, ...values: unknown[]) => {
			let cmd = strings[0] || '';
			for (let i = 0; i < values.length; i++) {
				cmd += values[i] + (strings[i + 1] || '');
			}
			commands.push(cmd.trim());

			return {
				text: () => {
					if (cmd.includes('--bumped-version')) return Promise.resolve('1.2.3');
					return Promise.resolve('');
				},
				// biome-ignore lint/suspicious/noExplicitAny: promise mock
				then: (resolve: (value: any) => any) =>
					Promise.resolve({
						exitCode: 0,
						text: () => (cmd.includes('--bumped-version') ? '1.2.3' : ''),
					}).then(resolve),
			};
		},
	);

	mockFunc.cwd = vi.fn().mockReturnValue(mockFunc);

	return { mockFunc, commands };
}

describe('ReleaseManager', () => {
	let mock: ReturnType<typeof createMockExecutor>;

	beforeEach(() => {
		mock = createMockExecutor();
		// Mock Bun globals
		// biome-ignore lint/suspicious/noExplicitAny: global mock
		(globalThis as any).Bun = {
			file: () => ({
				json: () => Promise.resolve({ version: '1.0.0' }),
			}),
			write: vi.fn(),
		};
	});

	it('should execute full release flow', async () => {
		// biome-ignore lint/suspicious/noExplicitAny: test mock
		const manager = new ReleaseManager(mock.mockFunc as any, {});
		await manager.run();

		expect(mock.commands).toContain('bun run test:all');
		expect(mock.commands).toContain('git-cliff --bump -o CHANGELOG.md');
		expect(mock.commands).toContain('git push --follow-tags');
		expect(mock.commands.some((c) => c.includes('git tag -a v1.2.3'))).toBe(
			true,
		);
	});

	it('should skip deployment if [no-deploy] is requested', async () => {
		// biome-ignore lint/suspicious/noExplicitAny: test mock
		const manager = new ReleaseManager(mock.mockFunc as any, {
			'no-deploy': true,
		});
		await manager.run();

		expect(mock.commands.some((c) => c.includes('[no-deploy]'))).toBe(true);
	});

	it('should skip destructive steps in dry run', async () => {
		// biome-ignore lint/suspicious/noExplicitAny: test mock
		const manager = new ReleaseManager(mock.mockFunc as any, { dry: true });
		await manager.run();

		expect(mock.commands).toContain('bun run test:all');
		expect(mock.commands).not.toContain('git push --follow-tags');
		expect(mock.commands.some((c) => c.includes('git-cliff --bump'))).toBe(
			false,
		);
	});

	it('should generate preview when requested', async () => {
		// biome-ignore lint/suspicious/noExplicitAny: test mock
		const manager = new ReleaseManager(mock.mockFunc as any, { preview: true });
		await manager.run();

		expect(mock.commands).toContain('git-cliff --unreleased --strip all');
		expect(mock.commands).not.toContain('bun run test:all');
	});
});
