import type {
  ButtonInteraction,
  CommandInteraction,
  GuildMember,
  TextChannel,
} from "discord.js";
import type { CaData } from "@typings/caTypes.js";
import { Requests } from "@requests/main.js";
import { getString } from "@utils/stringRepo.js";
import { container } from "tsyringe";
import type IRankService from "@utils/rankUtils/IRankService.js";

const acceptHelper = async (
  interaction: CommandInteraction | ButtonInteraction,
  ca: CaData
) => {
  if (!interaction.guild) return getString("errors", "noGuild");

  const rankService = container.resolve<IRankService>("RankService");

  const channel = (await interaction.client.channels.fetch(
    ca.channel
  )) as TextChannel;
  if (!channel) return getString("errors", "channelNotFound");

  await channel.messages.fetch(ca.message);
  await channel.messages.delete(ca.message);

  // Call the atomic complete endpoint
  const res = await Requests.completeCombatAchievement(
    ca.guildId,
    ca.caName,
    ca.userIds
  );

  if (res.error) {
    return getString("errors", "givingPoints");
  }

  const response: string[] = [];
  response.push(getString("ca", "approved", { caName: ca.caName }));

  const invoker = interaction.member as GuildMember;

  for (const u of res.data) {
    const member = ca.members.find((m) => m.id === u.user_id);
    if (!member) continue;

    response.push(
      getString("ranks", "pointsGranted", {
        username: member.displayName,
        pointsGiven: u.given_points,
        grantedBy: invoker.displayName,
        totalPoints: u.points,
      })
    );

    const newRank = await rankService.rankUpHandler(
      interaction,
      member,
      u.points - u.given_points,
      u.points
    );

    if (!newRank) continue;

    const newRankIcon = rankService.getIcon(newRank);
    response.push(
      getString("ranks", "levelUpMessage", {
        username: member.displayName,
        icon: newRankIcon,
        rankName: newRank,
      })
    );
  }

  return response;
};

export default acceptHelper;
