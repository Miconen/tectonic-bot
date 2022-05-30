import pool from './pooling.js';

const INSERT_QUERY = `INSERT INTO users (guild_id, user_id)
						SELECT * FROM (SELECT $1 as guild_id, $2 as user_id) AS val
						WHERE NOT EXISTS (SELECT guild_id FROM users WHERE guild_id = $1 AND user_id = $2) LIMIT 1;`;

const newUser = async (guild_id: string, user_id: string) => {
	await pool.connect();
	pool.query(INSERT_QUERY, [guild_id, user_id])
		.then((res) => {
			if (res.rowCount === 0) {
				console.log(
					`User ${user_id} already exists in guild ${guild_id}`
				);
			} else {
				console.log(`Created user ${user_id} in guild ${guild_id}`);
			}
		})
		.catch((err) => {
			console.error(err);
		});
};

export default newUser;
