import { execSync } from 'child_process';
import { sql } from 'drizzle-orm';

export async function setup() {
	// Ensure test environment variables are set
	process.env.DB_PORT = '5433';
	process.env.DB_NAME = 'qwertix_test';

	try {
		// Dynamic import to ensure process.env is set
		const { DataBase } = await import('../src/db');
		const db = new DataBase();

		await db.source.execute(sql.raw('DROP SCHEMA IF EXISTS public CASCADE'));
		await db.source.execute(sql.raw('CREATE SCHEMA public'));

		console.log('Synchronizing test database schema via db:push...');
		// Use db:push because it ensures the schema matches exactly (removes stale columns)
		// We use execSync to run the drizzle-kit command
		execSync('bun run db:push', {
			env: {
				...process.env,
				DB_PORT: '5433',
				DB_NAME: 'qwertix_test',
			},
			stdio: 'inherit',
		});
		console.log('Global E2E setup: Schema synchronized');

		// Initial data cleanup (not needed if we dropped schema, but keeps seed data clean logic if any)
		// const tables = ['replays', 'results', 'presets', 'users'];
		// ...
	} catch (error) {
		console.error('Global E2E setup failed:', error);
		throw error;
	}
}
