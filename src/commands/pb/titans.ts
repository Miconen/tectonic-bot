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

@Discord()
@SlashGroup("pb")
@Guard(IsValidTime("time"), IsActivated())
class royaltitanspb {
  @Slash({ name: "titans", description: "Request your new pb to be added" })
  async titans(
    @SlashOption({
      name: "time",
      description: "Royal Titans pb time",
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
      getBoss("royal_titans", team),
      time,
      team,
      screenshot.url,
      interaction
    );
  }
}
