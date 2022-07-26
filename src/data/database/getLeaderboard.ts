import createQuery from './createQuery.js';
import IronmanIconMap from '../IronmanIconMap.js';

const QUERY = `SELECT rsn, points, type FROM rsn INNER JOIN users ON users.id = rsn.user AND users.guild_id=? ORDER BY points DESC LIMIT 50`;

const getLeaderboard = async (guild_id: string) => {
	return await createQuery(QUERY, [guild_id])
		.then((res: any) => {
			let leaderboard: any[] = [];
			res.forEach((row: any, index: number) => {
				// TODO: Use rsn instead of pinging the user
				leaderboard.push({
					name: `**${row.rsn}** ${IronmanIconMap.get(row.type)}`,
					value: `${row.points} points.`,
				});
			});

			return leaderboard;
		})
		.catch((err) => {
			throw err;
		});
};

export default getLeaderboard;
