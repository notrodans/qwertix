import { $ } from 'bun';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';

/**
 * Release Management Orchestrator
 *
 * This script handles the full release cycle:
 * 1. Validation (Tests)
 * 2. Versioning (Git-Cliff + Manual package.json update)
 * 3. Documentation (Changelog generation)
 * 4. Git Orchestration (Commit, Tag, Push)
 *
 * It avoids using 'npm version' to prevent conflicts with Bun's 'catalog:' protocol.
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

		// 1. Validation
		await this.step(
			'Running Tests',
			async () => {
				if (this.isPreview) return;
				await this.executor.cwd(this.rootDir)`bun run test:all`;
			},
			true,
		);

		// 2. Preview Mode
		if (this.isPreview) {
			await this.step(
				'Generating Changelog Preview',
				async () => {
					await this.executor.cwd(
						this.rootDir,
					)`git-cliff --unreleased --strip all`;
				},
				true,
			);
			return;
		}

		// 3. Version Bump
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

			await this.executor.cwd(this.rootDir)`git-cliff --bump -o CHANGELOG.md`;
		});

		// 4. Git Commit & Tag
		const tagName = `v${nextVersion}`;
		await this.step('Creating Git Commit and Tag', async () => {
			const commitMsg =
				`chore(release): prepare for ${tagName} ${this.isNoDeploy ? '[no-deploy]' : ''}`.trim();

			await this.executor.cwd(
				this.rootDir,
			)`git add package.json CHANGELOG.md libs/release/package.json`;
			await this.executor.cwd(this.rootDir)`git commit -m ${commitMsg}`;
			await this.executor.cwd(
				this.rootDir,
			)`git tag -a ${tagName} -m ${tagName}`;
		});

		// 5. Publish
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
