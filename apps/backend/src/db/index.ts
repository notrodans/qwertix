import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../env';
import * as schema from './schema';

type DataSource = NodePgDatabase<typeof schema> & {
	$client: Pool;
};

export class DataBase {
	readonly source: DataSource;

	constructor() {
		const pool = new Pool({
			host: env.DB_HOST,
			port: env.DB_PORT,
			user: env.DB_USER,
			password: env.DB_PASSWORD,
			database: env.DB_NAME,
		});

		this.source = drizzle(pool, { schema });
	}
}
