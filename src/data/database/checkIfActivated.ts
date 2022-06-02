import pool from './pooling.js';

const CHECK_QUERY = `SELECT COUNT(1) FROM users WHERE (guild_id='979445890064470036' AND user_id='136856906139566081')`;

const removeUser = async (
	guild_id: string,
	user_id: string,
	callback: (arg0: boolean) => void
) => {
	let result = false;
	const connection = await pool.connect();
	connection
		.query(CHECK_QUERY)
		.then((res) => {
			console.log(res.rows[0].count);

			if (res.rows[0].count) result = true;
			if (!res.rows[0].count) result = false;

			callback(result);
		})
		.catch((err) => {
			console.error(err);
		})
		.finally(() => {
			connection.release();
		});
};

export default removeUser;
