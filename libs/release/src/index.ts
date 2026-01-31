import { $ } from 'bun';
import { parseArgs } from 'util';

export type ShellExecutor = typeof $;

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
	private $: ShellExecutor;
	private isDry: boolean;
	private isNoDeploy: boolean;
	private isPreview: boolean;

	constructor(executor: ShellExecutor, options: ReleaseOptions) {
		this.$ = executor;
		this.isDry = !!options.dry;
		this.isNoDeploy = !!options['no-deploy'];
		this.isPreview = !!(
			options.preview ||
			options['preview-fe'] ||
			options['preview-be']
		);
	}

	private async runStep(
		name: string,
		action: () => Promise<unknown>,
		forceRun = false,
	) {
		console.log(`\n📦 Step: ${name}`);
		if (this.isDry && !forceRun) {
			console.log('  [Skipped due to --dry]');
			return;
		}
		try {
			await action();
			console.log('  ✅ Done.');
		} catch (error) {
			console.error('  ❌ Failed:', error);
			throw error;
		}
	}

	public async run() {
		console.log('🚀 Starting Release Process...');
		if (this.isDry)
			console.log('[DRY RUN] No changes will be committed or pushed.');

		// 1. Run Tests
		await this.runStep(
			'Tests',
			async () => {
				if (this.isPreview) return;
				await this.$`bun --cwd ../.. run test:all`;
			},
			true,
		); // Always run tests even in dry run unless preview

		// 2. Preview or Generate Changelog
		if (this.isPreview) {
			await this.runStep(
				'Preview Changelog',
				async () => {
					await this.$`git-cliff --unreleased --strip all`;
				},
				true,
			); // Always run preview
			return;
		}

		// 3. Bump Version & Changelog
		await this.runStep('Bump Version & Generate Changelog', async () => {
			await this.$`git-cliff --bump -o CHANGELOG.md`;

			const nextVersion = (
				await this.$`git-cliff --bumped-version`.text()
			).trim();
			if (!nextVersion) {
				throw new Error('Could not determine next version.');
			}
			console.log(`  Target Version: ${nextVersion}`);

			await this
				.$`npm version ${nextVersion} --no-git-tag-version --allow-same-version`;
		});

		// 4. Commit and Tag
		await this.runStep('Commit and Tag', async () => {
			const version = (
				await this.$`node -p "require('./package.json').version"`
			)
				.text()
				.trim();
			const tagName = `v${version}`;

			const commitMsg = `chore(release): prepare for ${tagName} ${
				this.isNoDeploy ? '[no-deploy]' : ''
			}`.trim();

			await this.$`git add package.json CHANGELOG.md`;
			await this.$`git commit -m "${commitMsg}"`;
			await this.$`git tag -a ${tagName} -m "Release ${tagName}"`;

			console.log(`  Tagged: ${tagName}`);
		});

		// 5. Push
		await this.runStep('Push to Remote', async () => {
			await this.$`git push origin main --follow-tags`;
			console.log('  🚀 Pushed to origin/main with tags.');
		});
	}
}

// Execution block - only run if directly executed
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
