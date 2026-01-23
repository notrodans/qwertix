import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../env';
import * as relations from './relations';
import * as schema from './schema';

const combinedSchema = { ...schema, ...relations };

type DataSource = NodePgDatabase<typeof combinedSchema> & {
	$client: Pool;
};

export class DataBase {
	readonly source: DataSource;

	constructor() {
		const pool = new Pool({
			connectionString: env.DATABASE_URL,
		});

		this.source = drizzle(pool, { schema: combinedSchema });
	}
}