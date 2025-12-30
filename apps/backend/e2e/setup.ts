// Ensure test environment variables are set before any imports that use them
// Port 5433 matches the docker-compose.test.yml
process.env.DB_PORT = '5433';
process.env.DB_NAME = 'qwertix_test';

import { sql } from 'drizzle-orm';
import { beforeAll } from 'vitest';
import { container } from '../src/container';
import type { DataBase } from '../src/db';

beforeAll(async () => {
	// We need to resolve the DB instance from the container
	const db = container.resolve<DataBase>('db');

	try {
		// Clean up database: truncate all tables and restart identities
		// The order matters if there are foreign keys, but CASCADE handles it.
		const tables = ['replays', 'results', 'presets', 'users'];

		for (const table of tables) {
			await db.source.execute(
				sql.raw(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`),
			);
		}

		console.log('Test database cleaned up successfully');
	} catch (error) {
		console.error('Failed to clean up test database:', error);
		throw error;
	}
});
