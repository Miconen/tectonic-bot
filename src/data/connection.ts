async function attemptConnection() {
	let retries = 5;
	let interval = 5000;
	while (retries) {
		try {
			await createConnection();
			break;
		} catch (err) {
			console.log(err);
			console.log(
				`Conenction failed, attempting ${retries} more times in ${interval}ms`
			);
			await new Promise((res) => setTimeout(res, interval));
			retries--;
		}
	}
}

const createConnection = () => {
	console.log('Connecting to database...');
};

export default attemptConnection;
