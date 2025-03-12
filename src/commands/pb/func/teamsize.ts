function teamsize(team: (string | undefined)[]) {
	return team.filter((player) => player).length;
}

export default teamsize;
