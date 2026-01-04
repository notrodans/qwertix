import { sql } from 'drizzle-orm';
import { execSync } from 'child_process';

export async function setup() {
	// Ensure test environment variables are set
	process.env.DB_PORT = '5433';
	process.env.DB_NAME = 'qwertix_test';

	try {
		console.log('Synchronizing test database schema via db:push...');
		// Use db:push because it ensures the schema matches exactly (removes stale columns)
		// We use execSync to run the drizzle-kit command
		execSync('bun run db:push', {
			env: {
				...process.env,
				DB_PORT: '5433',
				DB_NAME: 'qwertix_test',
			},
		});
		console.log('Global E2E setup: Schema synchronized');

		// Dynamic import to ensure process.env is set for the cleanup
		const { DataBase } = await import('../src/db');
		const db = new DataBase();

		// Initial data cleanup
		const tables = ['replays', 'results', 'presets', 'users'];
		for (const table of tables) {
			await db.source.execute(
				sql.raw(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`),
			);
		}
		console.log('Global E2E setup: Database cleaned');
	} catch (error) {
		console.error('Global E2E setup failed:', error);
		throw error;
	}
}
