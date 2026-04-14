import type {
  EventDetails,
  EventWinParam,
  EventUpdateParam,
  EventParticipation,
} from "@typings/api/event";
import { fetchData } from "./main";

export async function getEvents(guild_id: string) {
  return await fetchData<EventDetails[]>(`guilds/${guild_id}/events`);
}

export async function getEventParticipants(guild_id: string, event_id: string) {
  return await fetchData<{ participations: EventParticipation[] }>(
    `guilds/${guild_id}/events/${event_id}`
  );
}

export async function eventWinners(guild_id: string, params: EventWinParam) {
  const body =
    params.type === "individual"
      ? { position_cutoff: params.top, event_id: params.competition }
      : { team_names: params.team_names, event_id: params.competition };

  return await fetchData(`guilds/${guild_id}/events`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateEvent(
  guild_id: string,
  event_id: string,
  params: EventUpdateParam
) {
  return await fetchData(`guilds/${guild_id}/events/${event_id}`, {
    method: "PUT",
    body: JSON.stringify(params),
  });
}

export async function deleteEvent(guild_id: string, event_id: string) {
  return await fetchData(`guilds/${guild_id}/events/${event_id}`, {
    method: "DELETE",
  });
}
