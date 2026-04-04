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
class tobpb {
  @Slash({ name: "tob", description: "Request your new pb to be added" })
  async tob(
    @SlashOption({
      name: "time",
      description: "Tob pb time",
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
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player2: GuildMember | null,
    @SlashOption({
      name: "player3",
      description: "Teammate discord @name",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player3: GuildMember | null,
    @SlashOption({
      name: "player4",
      description: "Teammate discord @name",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player4: GuildMember | null,
    @SlashOption({
      name: "player5",
      description: "Teammate discord @name",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player5: GuildMember | null,
    interaction: CommandInteraction
  ) {
    const team = [
      interaction.user.id,
      player2?.user.id,
      player3?.user.id,
      player4?.user.id,
      player5?.user.id,
    ].filter(notEmpty);

    await interaction.deferReply();
    await pbRequestHelper(
      getBoss("tob", team),
      time,
      team,
      screenshot.url,
      interaction
    );
  }
}
