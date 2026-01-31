import { parseArgs } from "util";
import { $ } from "bun";

// Parse arguments
const { values } = parseArgs({
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

const isDry = values.dry;
const isNoDeploy = values['no-deploy'];
const isPreview = values.preview || values['preview-fe'] || values['preview-be'];

console.log(`🚀 Starting Release Process...`);
if (isDry) console.log(`[DRY RUN] No changes will be committed or pushed.`);

async function runStep(name: string, action: () => Promise<any>) {
  console.log(`\n📦 Step: ${name}`);
  if (isDry && name !== "Tests" && name !== "Preview Changelog") {
    console.log(`  [Skipped due to --dry]`);
    return;
  }
  try {
    await action();
    console.log(`  ✅ Done.`);
  } catch (error) {
    console.error(`  ❌ Failed:`, error);
    process.exit(1);
  }
}

// 1. Run Tests (Always run unless specifically skipped, keeping it safe)
// Using 'test:all' as defined in package.json
await runStep("Tests", async () => {
  if (isPreview) return; // Skip tests for simple preview
  await $`bun run test:all`;
});

// 2. Preview or Generate Changelog
if (isPreview) {
  await runStep("Preview Changelog", async () => {
    // Generate unreleased changelog to stdout
    await $`git-cliff --unreleased --strip all`;
  });
  process.exit(0);
}

// 3. Bump Version & Changelog
await runStep("Bump Version & Generate Changelog", async () => {
  // git-cliff --bump automatically calculates the next version based on conventional commits
  // -o CHANGELOG.md writes it to file
  await $`git-cliff --bump -o CHANGELOG.md`;
  
  // Update package.json version to match the new tag (extracted from git-cliff logic ideally, 
  // but for simplicity we rely on git-cliff's tag prediction or user manual input if cliff fails context).
  // Ideally, we read the new version from the changelog or let npm version handle it.
  // For this setup, let's use npm version to standardise bumping.
  
  // Simple approach: Get expected next version
  const nextVersion = (await $`git-cliff --bumped-version`.text()).trim();
  if (!nextVersion) {
    throw new Error("Could not determine next version.");
  }
  console.log(`  Target Version: ${nextVersion}`);
  
  // Bump package.json without git tag (git-cliff does the changelog)
  await $`npm version ${nextVersion} --no-git-tag-version --allow-same-version`;
});

// 4. Commit and Tag
await runStep("Commit and Tag", async () => {
  const version = (await $`node -p "require('./package.json').version"`).text().trim();
  const tagName = `v${version}`;
  
  // Add [no-deploy] to commit message if requested
  const commitMsg = `chore(release): prepare for ${tagName} ${isNoDeploy ? '[no-deploy]' : ''}`.trim();

  await $`git add package.json CHANGELOG.md`;
  await $`git commit -m "${commitMsg}"`;
  await $`git tag -a ${tagName} -m "Release ${tagName}"`;
  
  console.log(`  Tagged: ${tagName}`);
});

// 5. Push
await runStep("Push to Remote", async () => {
  await $`git push origin main --follow-tags`;
  console.log(`  🚀 Pushed to origin/main with tags.`);
});
