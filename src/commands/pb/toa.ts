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
import { getBossToa } from "./func/getBoss.js";
import pbRequestHelper from "./func/pbRequestHelper.js";
import RequiresGuild from "@guards/RequiresGuild.js";

@Discord()
@SlashGroup("pb")
@Guard(RequiresGuild, IsValidTime("time"), IsActivated())
class ToaPb {
  @Slash({ name: "toa", description: "Request your new pb to be added" })
  async toa(
    @SlashOption({
      name: "time",
      description: "ToA pb time",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    time: string,
    @SlashOption({
      name: "raidlevel",
      description: "ToA raid level",
      required: true,
      type: ApplicationCommandOptionType.Number,
    })
    raidlevel: number,
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
    @SlashOption({
      name: "player6",
      description: "Teammate discord @name",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player6: GuildMember | null,
    @SlashOption({
      name: "player7",
      description: "Teammate discord @name",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player7: GuildMember | null,
    @SlashOption({
      name: "player8",
      description: "Teammate discord @name",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player8: GuildMember | null,
    interaction: CommandInteraction<"cached">
  ) {
    const team = [
      interaction.user.id,
      player2?.user.id,
      player3?.user.id,
      player4?.user.id,
      player5?.user.id,
      player6?.user.id,
      player7?.user.id,
      player8?.user.id,
    ].filter(notEmpty);

    await interaction.deferReply();
    await pbRequestHelper(
      getBossToa("toa", team, raidlevel),
      time,
      team,
      screenshot.url,
      interaction
    );
  }
}
