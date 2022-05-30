import pool from './pooling.js';

async function createConnection() {
	let retries = 5;
	let interval = 5000;
	while (retries) {
		try {
			await pool.connect();
			console.log('Connected to database');
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
