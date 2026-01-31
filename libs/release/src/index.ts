import { $ } from 'bun';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';

/**
 * Release Management Orchestrator
 *
 * This script handles the release orchestration:
 * 1. Versioning (Git-Cliff + Manual package.json update)
 * 2. Git Orchestration (Commit, Tag, Push)
 *
 * It avoids using 'npm version' to prevent conflicts with Bun's 'catalog:' protocol.
 * Tests and Changelog generation are handled by CI.
 */

export interface ReleaseOptions {
	preview?: boolean;
	'preview-fe'?: boolean;
	'preview-be'?: boolean;
	fe?: boolean;
	be?: boolean;
	'no-deploy'?: boolean;
	dry?: boolean;
}

export class ReleaseManager {
	private isDry: boolean;
	private isNoDeploy: boolean;
	private isPreview: boolean;
	private rootDir: string;
	private releaseDir: string;

	constructor(
		private executor: typeof $,
		options: ReleaseOptions,
	) {
		this.isDry = !!options.dry;
		this.isNoDeploy = !!options['no-deploy'];
		this.isPreview = !!(
			options.preview ||
			options['preview-fe'] ||
			options['preview-be']
		);

		const currentDir = dirname(fileURLToPath(import.meta.url));
		this.releaseDir = join(currentDir, '..');
		this.rootDir = join(currentDir, '../../..');
	}

	private async step(name: string, action: () => Promise<void>, force = false) {
		console.log(`\n📦 [Step] ${name}`);
		if (this.isDry && !force) {
			console.log('   ⚠️  Skipped (Dry Run)');
			return;
		}
		try {
			await action();
			console.log('   ✅ Success');
		} catch (error) {
			console.error(`   ❌ Failed: ${name}`);
			throw error;
		}
	}

	private async getNextVersion(): Promise<string> {
		const result = await this.executor.cwd(
			this.rootDir,
		)`git-cliff --bumped-version`.text();
		const version = result.trim();
		if (!version)
			throw new Error('Could not calculate next version with git-cliff');
		return version;
	}

	public async run() {
		console.log('🚀 Initializing Release...');
		if (this.isDry) console.log('🧪 Mode: DRY RUN');

		// 1. Preview Mode (Version only)
		if (this.isPreview) {
			const version = await this.getNextVersion();
			console.log(`\nℹ️  Next estimated version: ${version}`);
			return;
		}

		// 2. Version Bump
		let nextVersion = '';
		await this.step('Calculating Version & Updating package.json', async () => {
			nextVersion = await this.getNextVersion();
			console.log(`   📈 Target Version: ${nextVersion}`);

			const filesToUpdate = [
				join(this.rootDir, 'package.json'),
				join(this.releaseDir, 'package.json'),
			];

			for (const filePath of filesToUpdate) {
				// biome-ignore lint/correctness/noUndeclaredVariables: Bun is global
				const pkg = await Bun.file(filePath).json();
				pkg.version = nextVersion;
				// biome-ignore lint/correctness/noUndeclaredVariables: Bun is global
				await Bun.write(filePath, `${JSON.stringify(pkg, null, '\t')}\n`);
			}
		});

		// 3. Git Commit & Tag
		const tagName = `v${nextVersion}`;
		await this.step('Creating Git Commit and Tag', async () => {
			const commitMsg = `chore(release): prepare for ${tagName} ${
				this.isNoDeploy ? '[no-deploy]' : ''
			}`.trim();

			await this.executor.cwd(
				this.rootDir,
			)`git add package.json libs/release/package.json`;
			await this.executor.cwd(this.rootDir)`git commit -m "${commitMsg}"`;
			await this.executor.cwd(
				this.rootDir,
			)`git tag -a ${tagName} -m ${tagName}`;
		});

		// 4. Publish
		await this.step('Pushing to Remote', async () => {
			await this.executor.cwd(this.rootDir)`git push --follow-tags`;
		});

		console.log(`\n🎉 Release ${tagName} completed successfully!`);
	}
}

if (import.meta.main) {
	const { values } = parseArgs({
		// biome-ignore lint/correctness/noUndeclaredVariables: Bun is global
		args: Bun.argv,
		options: {
			preview: { type: 'boolean' },
			'preview-fe': { type: 'boolean' },
			'preview-be': { type: 'boolean' },
			fe: { type: 'boolean' },
			be: { type: 'boolean' },
			'no-deploy': { type: 'boolean' },
			dry: { type: 'boolean' },
		},
		strict: true,
		allowPositionals: true,
	});

	const manager = new ReleaseManager($, values);
	await manager.run().catch(() => process.exit(1));
}
