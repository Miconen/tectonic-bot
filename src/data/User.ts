class User {
	name: string;
	guildId: string;
	points: number;
	constructor(name: string, guildId: string, points: number) {
		this.name = name;
		this.guildId = guildId;
		this.points = points;
	}
}

export default User;
