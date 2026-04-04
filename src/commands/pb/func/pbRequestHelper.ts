import type { PbCache, PbData } from "@typings/pbTypes.js";
import { Requests } from "@requests/main.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import TimeConverter from "./TimeConverter.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type CommandInteraction,
  type GuildMember,
} from "discord.js";

const pbRequestHelper = async (
  boss: string,
  time: string,
  team: string[],
  screenshot: string,
  interaction: CommandInteraction,
  state: PbCache
) => {
  if (!interaction.channel)
    return await replyHandler(getString("errors", "noChannel"), interaction);
  if (!interaction.guild)
    return await replyHandler(getString("errors", "noGuild"), interaction);

  const ticks = TimeConverter.timeToTicks(time);
  if (!ticks) {
    return await replyHandler(
      getString("times", "failedParsingTicks"),
      interaction
    );
  }

  // Check if this would actually be a new PB
  const guildTimes = await Requests.getGuildTimes(interaction.guild.id);
  if (!guildTimes.error && guildTimes.data?.pbs) {
    const currentPb = guildTimes.data.pbs.find((pb) => pb.boss_name === boss);
    if (currentPb && ticks >= currentPb.time) {
      return await replyHandler(
        getString("pb", "notFaster", {
          time: TimeConverter.ticksToTime(ticks),
          currentTime: TimeConverter.ticksToTime(currentPb.time),
        }),
        interaction,
        { ephemeral: true }
      );
    }
  }

  const members = await interaction.guild.members.fetch({ user: team });
  const playerMentions = members.map((m) => `<@${m.id}>`).join(", ");

  const confirm = new ButtonBuilder()
    .setCustomId("pbButtonAccept")
    .setLabel("Accept")
    .setStyle(ButtonStyle.Success);

  const deny = new ButtonBuilder()
    .setCustomId("pbButtonDeny")
    .setLabel("Deny")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    confirm,
    deny
  );

  await replyHandler(
    getString("pb", "requestSubmitted", {
      username: (interaction.member as GuildMember).displayName,
      boss,
      time: `${TimeConverter.ticksToTime(ticks)} (${ticks} ticks)`,
      players: playerMentions,
    }),
    interaction
  );

  const message = await interaction.editReply({
    components: [row],
    files: [screenshot],
  });

  const data: PbData = {
    boss,
    time,
    team,
    channel: interaction.channel.id,
    message: message.id,
    timestamp: Date.now(),
  };

  state.set(interaction.id, data);
};

export default pbRequestHelper;
