import postgres from 'pg';
const { Pool } = postgres;

const POOL_CONNECTIONS = 20;

/** This is the client pool for the database.
 *
 * @method connect() - Get a database connection
 *
 * You need to call `release()` when you're done with your connection or it will leak.
 */
const pool = new Pool({
	database: 'tectonic',
	host: 'db',
	user: 'root',
	password: 'root',
	port: 5432,
	max: POOL_CONNECTIONS,
});

export default pool;
