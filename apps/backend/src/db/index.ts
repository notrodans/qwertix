import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

const { Pool } = pg;

const pool = new Pool({
	user: process.env.DB_USER || 'postgres',
	host: process.env.DB_HOST || 'localhost',
	database: process.env.DB_NAME || 'qwertix',
	password: process.env.DB_PASSWORD || 'postgres',
	port: parseInt(process.env.DB_PORT || '5432', 10),
});

pool.on('error', (err) => {
	console.error('Unexpected error on idle client', err);
	process.exit(-1);
});

const db = drizzle(pool, { schema });

export default db;
