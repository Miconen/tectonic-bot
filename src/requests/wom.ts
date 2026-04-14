import type { CompetitionDetails } from "@wise-old-man/utils";
import type { CompetitionResponse } from "@typings/api/event";
import { fetchData } from "./main";
import { rewrapResponse } from "./utils";

export async function getCompetition(id: number) {
  return await fetchData<CompetitionDetails>(
    `competitions/${id}`,
    {},
    "https://api.wiseoldman.net/v2/"
  );
}

export async function getCompetitionTeams(id: number) {
  const res = await getCompetition(id);
  if (res.error) return res;

  const teamNames = new Set(
    res.data.participations
      .map((p) => p.teamName)
      .filter((n) => n != null) as string[]
  );

  return rewrapResponse<string[], CompetitionDetails>(res, [...teamNames]);
}

export async function eventCompetition(
  guild_id: string,
  competition_id: number,
  cutoff: number
) {
  return await fetchData<CompetitionResponse>(
    `guilds/${guild_id}/wom/competition/${competition_id}/cutoff/${cutoff}`
  );
}
