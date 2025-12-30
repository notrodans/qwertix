import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import path from 'path';

export async function setup() {
	// Ensure test environment variables are set BEFORE importing anything that uses env
	process.env.DB_PORT = '5433';
	process.env.DB_NAME = 'qwertix_test';

	// Dynamic import to ensure process.env is set
	const { DataBase } = await import('../src/db');
	const db = new DataBase();

	try {
		console.log('Running global E2E setup: Migrations...');
		await migrate(db.source, {
			migrationsFolder: path.resolve(__dirname, '../drizzle'),
		});
		console.log('Global E2E setup: Migrations completed');

		// Initial cleanup
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
