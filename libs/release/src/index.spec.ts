import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReleaseManager } from './index';

function reconstructCmd(args: unknown[]) {
	const strings = args[0] as TemplateStringsArray;
	const values = args.slice(1);
	let cmd = strings[0] || '';
	values.forEach((v, i) => {
		cmd += v + (strings[i + 1] || '');
	});
	return cmd.trim();
}

describe('ReleaseManager', () => {
	// biome-ignore lint/suspicious/noExplicitAny: mock
	let mockShell: any;
	let executedCommands: string[] = [];

	beforeEach(() => {
		executedCommands = [];
		mockShell = vi.fn((strings: TemplateStringsArray, ...values: unknown[]) => {
			const cmd = reconstructCmd([strings, ...values]);
			executedCommands.push(cmd);

			const getOutput = () => {
				if (cmd.includes('git-cliff --bumped-version')) return '1.2.3\n';
				if (cmd.includes('package.json') && cmd.includes('version'))
					return '1.2.3\n';
				return '';
			};

			return {
				// Pattern 1: await $`cmd`.text()
				text: () => Promise.resolve(getOutput()),

				// Pattern 2: (await $`cmd`).text()
				// biome-ignore lint/suspicious/noExplicitAny: generic promise callback
				then: (onfulfilled: (value: any) => any) => {
					const output = getOutput();
					return Promise.resolve({
						exitCode: 0,
						stdout: Buffer.from(output),
						text: () => output,
					}).then(onfulfilled);
				},
			};
		});
	});

	it('should run preview flow correctly', async () => {
		const manager = new ReleaseManager(mockShell, { preview: true });
		await manager.run();

		expect(executedCommands).not.toContain('bun --cwd ../.. run test:all');
		expect(executedCommands).toContain('git-cliff --unreleased --strip all');
		expect(executedCommands.some((c) => c.includes('git tag'))).toBe(false);
	});

	it('should run dry run flow correctly', async () => {
		const manager = new ReleaseManager(mockShell, { dry: true });
		await manager.run();

		expect(executedCommands).toContain('bun --cwd ../.. run test:all');
		expect(executedCommands.some((c) => c.includes('git-cliff --bump'))).toBe(
			false,
		);
	});

	it('should run full release flow correctly', async () => {
		const manager = new ReleaseManager(mockShell, { dry: false });
		await manager.run();

		expect(executedCommands).toContain('bun --cwd ../.. run test:all');
		expect(executedCommands).toContain('git-cliff --bump -o CHANGELOG.md');
		expect(executedCommands).toContain('git-cliff --bumped-version');
		expect(
			executedCommands.some((c) => c.startsWith('npm version 1.2.3')),
		).toBe(true);
		expect(executedCommands).toContain('git add package.json CHANGELOG.md');
		expect(executedCommands).toContain(
			'git commit -m "chore(release): prepare for v1.2.3"',
		);
		expect(executedCommands).toContain('git tag -a v1.2.3 -m "Release v1.2.3"');
		expect(executedCommands).toContain('git push origin main --follow-tags');
	});

	it('should add [no-deploy] flag when requested', async () => {
		const manager = new ReleaseManager(mockShell, { 'no-deploy': true });
		await manager.run();

		expect(executedCommands).toContain(
			'git commit -m "chore(release): prepare for v1.2.3 [no-deploy]"',
		);
	});

	it('should treat --preview-fe as preview', async () => {
		const manager = new ReleaseManager(mockShell, { 'preview-fe': true });
		await manager.run();

		expect(executedCommands).toContain('git-cliff --unreleased --strip all');
		expect(executedCommands).not.toContain('bun --cwd ../.. run test:all');
	});
});
