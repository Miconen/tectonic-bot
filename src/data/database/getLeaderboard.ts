import { EmbedFieldData } from 'discord.js';
import createQuery from './createQuery.js';

const QUERY = `SELECT * FROM users WHERE guild_id=? ORDER BY points DESC LIMIT 50;`;

const getLeaderboard = async (guild_id: string, guild_members: any) => {
	return await createQuery(QUERY, [guild_id])
		.then((res: any) => {
			let leaderboard: EmbedFieldData[] = [];
			res.forEach((row: any, index: number) => {
				// TODO: Use rsn instead of pinging the user
				let user_id = row.user_id;
				let points = `**#${index + 1}** ${row.points} points`;
				leaderboard.push({
					name: user_id,
					value: points,
				});
			});

			return leaderboard;
		})
		.catch((err) => {
			throw err;
		});
};

export default getLeaderboard;
