const { Client } = require('pg');

const client = new Client({
	// TODO: Figure out a static ip for postgres server
	host: '127.0.0.1',
	user: 'root',
	port: 5432,
	password: 'root',
	database: 'tectonic',
});

async function createConnection() {
	let retries = 5;
	let interval = 5000;
	while (retries) {
		try {
			await client.connect();
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
	client.query('SELECT * from users', (err: any, res: any) => {
		console.log(err ? err : res);
	});
}

export default createConnection;
