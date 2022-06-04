import { Connection } from 'pg';
import pool from './pooling.js';

async function createConnection() {
	let retries = 3;
	let interval = 100;
	while (retries) {
		try {
			pool.getConnection((err, connection) => {
				console.log('Connected to database');
				connection.release();
			});
			break;
		} catch (err) {
			console.log(
				`Can't connect, attempting ${retries} more times in ${interval}ms`
			);
			await new Promise((res) => setTimeout(res, interval));
			retries--;
		}
	}
}

export default createConnection;
