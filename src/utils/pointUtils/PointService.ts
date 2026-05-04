import { Requests } from "@requests/main.js";
import { getString } from "@utils/stringRepo.js";
import type {
  BaseInteraction,
  ButtonInteraction,
  CommandInteraction,
  GuildMember,
} from "discord.js";
import { Collection } from "discord.js";
import { inject, injectable, singleton } from "tsyringe";
import type IRankService from "../rankUtils/IRankService.js";
import type IPointService from "./IPointService.js";
import { formatDisplayName } from "@utils/formatDisplayName.js";
import type {
  CustomPoints,
  PresetPoints,
  PointsParam,
  PointsResponse,
} from "@typings/api/points.js";

@singleton()
@injectable()
export class PointService implements IPointService {
  constructor(@inject("RankService") private rankService: IRankService) {}

  async givePoints(
    value: string | number,
    target: GuildMember | Collection<string, GuildMember>,
    interaction: CommandInteraction<"cached"> | ButtonInteraction<"cached">
  ) {
    const points =
      typeof value === "number"
        ? ({ type: "custom" as const, amount: value } as CustomPoints)
        : ({ type: "preset" as const, event: value } as PresetPoints);

    const userIds =
      target instanceof Collection ? target.map((m) => m.id) : [target.id];

    const members =
      target instanceof Collection
        ? target
        : new Collection<string, GuildMember>([[target.id, target]]);

    const param: PointsParam = { user_id: userIds, points };

    const res = await Requests.givePointsToMultiple(
      interaction.guild.id,
      param
    );

    if (res.error) {
      return getString("errors", "errorGivingPoints", {
        message: res.message,
      });
    }

    return this.buildResponses(res.data, members, interaction);
  }

  private async buildResponses(
    data: PointsResponse[],
    members: Collection<string, GuildMember>,
    interaction: BaseInteraction<"cached">
  ): Promise<string[]> {
    const response: string[] = [];

    for (const entry of data) {
      const member = members.get(entry.user_id);
      if (!member) {
        response.push(
          getString("errors", "couldntGetUser", {
            userId: entry.user_id,
          })
        );
        continue;
      }

      response.push(await this.buildPointsLine(entry, member, interaction));
    }

    return response;
  }

  private async buildPointsLine(
    entry: PointsResponse,
    member: GuildMember,
    interaction: BaseInteraction<"cached">
  ): Promise<string> {
    const oldPoints = entry.points - entry.given_points;
    const newPoints = entry.points;

    const oldRank = this.rankService.getRankByPoints(oldPoints);
    const newRank = this.rankService.getRankByPoints(newPoints);
    const oldIcon = this.rankService.getIcon(oldRank);
    const newIcon = this.rankService.getIcon(newRank);

    const rankChanged = oldRank !== newRank;

    if (rankChanged) {
      await this.rankService.rankUpHandler(
        interaction,
        member,
        oldPoints,
        newPoints
      );

      const template =
        entry.given_points >= 0
          ? "pointsGrantedRankUp"
          : "pointsGrantedRankDown";

      return getString("ranks", template, {
        username: member.displayName,
        pointsGiven: entry.given_points,
        oldPoints,
        newPoints,
        oldIcon,
        newIcon,
        rankName: formatDisplayName(newRank),
      });
    }

    return getString("ranks", "pointsGranted", {
      username: member.displayName,
      pointsGiven: entry.given_points,
      oldPoints,
      newPoints,
      icon: newIcon,
    });
  }
}
