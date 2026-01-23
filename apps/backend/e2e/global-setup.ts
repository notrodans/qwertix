import { execSync } from 'child_process';
import { sql } from 'drizzle-orm';

export async function setup() {
	// Ensure test environment variables are set
	process.env.DATABASE_URL =
		process.env.DATABASE_URL ||
		'postgresql://postgres:postgres@localhost:5433/qwertix_test';
	process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
	process.env.RESULT_HASH_SALT = process.env.RESULT_HASH_SALT || 'test_salt';
	process.env.NODE_ENV = 'test';

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
			},
			stdio: 'inherit',
		});
		console.log('Global E2E setup: Schema synchronized');
	} catch (error) {
		console.error('Global E2E setup failed:', error);
		throw error;
	}
}