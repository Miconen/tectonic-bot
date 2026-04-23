import type { TeamParam } from "@typings/api/team";
import { fetchData } from "./main";

function teamParamHandler(query: TeamParam) {
  if (query.type === "run_id") return `id/${query.run_id}`;
  return `boss/${query.boss}`;
}

export async function addToTeam(
  guild_id: string,
  user_id: string,
  params: TeamParam
) {
  return await fetchData(
    `guilds/${guild_id}/teams/${teamParamHandler(params)}`,
    {
      method: "POST",
      body: JSON.stringify({ guild_id, user_id }),
    }
  );
}

export async function removeFromTeam(
  guild_id: string,
  user_id: string,
  params: TeamParam
) {
  return await fetchData(
    `guilds/${guild_id}/teams/${teamParamHandler(params)}`,
    {
      method: "DELETE",
      body: JSON.stringify({ guild_id, user_id }),
    }
  );
}
