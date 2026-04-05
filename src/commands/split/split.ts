import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import {
  ApplicationCommandOptionType,
  type Attachment,
  type CommandInteraction,
  type GuildMember,
} from "discord.js";
import { Discord, Guard, Slash, SlashChoice, SlashOption } from "discordx";
import splitHelper from "./func/splitHelper.js";
import IsActivated from "@guards/IsActivated.js";

@Discord()
@Guard(IsActivated())
class split {
  @Slash({ name: "split", description: "Receive points for splitting" })
  async split(
    @SlashChoice({ name: "2-100m", value: "split_low" })
    @SlashChoice({ name: "100-500m", value: "split_medium" })
    @SlashChoice({ name: "500m+", value: "split_high" })
    @SlashOption({
      name: "value",
      description: "Value of the split drop?",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    value: string,
    @SlashOption({
      name: "screenshot",
      description: "Screenshot proof of the drop",
      required: true,
      type: ApplicationCommandOptionType.Attachment,
    })
    screenshot: Attachment,
    @SlashOption({
      name: "player2",
      description: "Teammate",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player2: GuildMember | null,
    @SlashOption({
      name: "player3",
      description: "Teammate",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player3: GuildMember | null,
    @SlashOption({
      name: "player4",
      description: "Teammate",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player4: GuildMember | null,
    @SlashOption({
      name: "player5",
      description: "Teammate",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player5: GuildMember | null,
    @SlashOption({
      name: "player6",
      description: "Teammate",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player6: GuildMember | null,
    @SlashOption({
      name: "player7",
      description: "Teammate",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player7: GuildMember | null,
    @SlashOption({
      name: "player8",
      description: "Teammate",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player8: GuildMember | null,
    interaction: CommandInteraction
  ) {
    if (!interaction.guild)
      return await replyHandler(getString("errors", "noGuild"), interaction);

    const invoker = interaction.member as GuildMember;
    const members = [
      invoker,
      player2,
      player3,
      player4,
      player5,
      player6,
      player7,
      player8,
    ].filter((m): m is GuildMember => m !== null && m !== undefined);

    const seen = new Set<string>();
    const uniqueMembers = members.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });

    await interaction.deferReply();
    await splitHelper(value, uniqueMembers, interaction, screenshot.url);
  }
}
