import IsActivated from "@guards/IsActivated.js";
import IsValidTime from "@guards/IsValidTime.js";
import { notEmpty } from "@utils/notEmpty.js";
import {
  ApplicationCommandOptionType,
  type Attachment,
  type CommandInteraction,
  type GuildMember,
} from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import getBoss from "./func/getBoss.js";
import pbRequestHelper from "./func/pbRequestHelper.js";
import { pbState } from "./func/pbState.js";

@Discord()
@SlashGroup("pb")
@Guard(IsValidTime("time"), IsActivated())
class yamapb {
  @Slash({ name: "yama", description: "Request your new pb to be added" })
  async yama(
    @SlashOption({
      name: "time",
      description: "Yama pb time",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    time: string,
    @SlashOption({
      name: "screenshot",
      description: "Screenshot proof of the time",
      required: true,
      type: ApplicationCommandOptionType.Attachment,
    })
    screenshot: Attachment,
    @SlashOption({
      name: "player2",
      description: "Teammate discord @name",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    player2: GuildMember,
    interaction: CommandInteraction
  ) {
    const team = [interaction.user.id, player2.user.id].filter(notEmpty);

    await interaction.deferReply();
    await pbRequestHelper(
      getBoss("yama", team),
      time,
      team,
      screenshot.url,
      interaction,
      pbState
    );
  }
}
