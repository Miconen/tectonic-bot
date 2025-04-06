import type { WomCompetition } from "@typings/womRequests";
import { fetchData } from "./main";
import { rewrapResponse } from "./utils";

export async function getCompetition(id: number) {
	const endpoint = `competitions/${id}`;
	const competition = await fetchData<WomCompetition>(
		endpoint,
		{},
		"https://api.wiseoldman.net/v2/",
	);

	return competition;
}

export async function getCompetitionTeams(id: number) {
	const res = await getCompetition(id);

	if (res.error) return res;

	const teamNames = new Set(res.data.participations.map((p) => p.teamName));
	return rewrapResponse<string[], WomCompetition>(res, [...teamNames]);
}
