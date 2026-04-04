import type { SplitRequest } from "@typings/requestTypes";
import type IPointService from "@utils/pointUtils/IPointService";
import { getString } from "@utils/stringRepo";
import type { RequestStrategy } from "./strategies";
import { container } from "tsyringe";
import { Collection, type GuildMember } from "discord.js";

export const splitStrategy: RequestStrategy<SplitRequest> = {
  async accept(interaction, data) {
    const pointService = container.resolve<IPointService>("PointService");

    const membersCollection = new Collection<string, GuildMember>();
    for (const m of data.members) {
      membersCollection.set(m.id, m);
    }

    const result = await pointService.givePoints(
      data.points,
      membersCollection,
      interaction
    );
    const pointsResult = Array.isArray(result) ? result.join("\n") : result;

    return [
      getString("splits", "approved", {
        sourceName: data.sourceName,
        points: data.points,
      }),
      pointsResult,
    ];
  },
  denyMessage(data) {
    return getString("splits", "denied", {
      sourceName: data.sourceName,
      points: data.points,
      username: data.members[0].displayName,
    });
  },
  label(data) {
    return `Split: ${data.sourceName} | ${data.points}pts — ${data.members[0].displayName}`;
  },
};
