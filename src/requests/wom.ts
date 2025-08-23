import type { WomCompetition } from "@typings/womRequests";
import type { CompetitionDetails } from "@wise-old-man/utils";
import { fetchData } from "./main";
import { rewrapResponse } from "./utils";

export async function getCompetition(id: number) {
	const endpoint = `competitions/${id}`;
	const competition = await fetchData<CompetitionDetails>(
		endpoint,
		{},
		"https://api.wiseoldman.net/v2/",
	);

	return competition;
}

export async function getCompetitionTeams(id: number) {
	const res = await getCompetition(id);

	if (res.error) return res;

	const teamNames = new Set(
		res.data.participations
			.map((p) => p.teamName)
			.filter((n) => n != null) as string[],
	);

	return rewrapResponse<string[], CompetitionDetails>(res, [...teamNames]);
}
