import pool from './pooling.js';

const INSERT_QUERY = `DELETE FROM users WHERE guild_id = $1 AND user_id = $2`;

const removeUser = async (guild_id: string, user_id: string) => {
	const connection = await pool.connect();
	connection
		.query(INSERT_QUERY, [guild_id, user_id])
		.then((res) => {
			if (res.rowCount === 0) {
				console.log(`Did not remove anything, did something go wrong?`);
			} else {
				console.log(`Removed user ${user_id} in guild ${guild_id}`);
			}
		})
		.catch((err) => {
			console.error(err);
		})
		.finally(() => {
			connection.release();
		});
};

export default removeUser;
