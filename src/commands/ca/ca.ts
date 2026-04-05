import { combatAchievementPicker } from "@pickers/combatAchievements";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import {
  ApplicationCommandOptionType,
  type Attachment,
  type CommandInteraction,
  type GuildMember,
} from "discord.js";
import { Discord, Guard, Slash, SlashOption } from "discordx";
import caHelper from "./func/caHelper.js";
import IsActivated from "@guards/IsActivated.js";

@Discord()
@Guard(IsActivated())
class CombatAchievement {
  @Slash({
    name: "ca",
    description: "Request points for completing a combat achievement together",
  })
  async ca(
    @SlashOption({
      name: "achievement",
      description: "The combat achievement completed",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: combatAchievementPicker,
    })
    achievement: string,
    @SlashOption({
      name: "screenshot",
      description: "Screenshot proof of the combat achievement",
      required: true,
      type: ApplicationCommandOptionType.Attachment,
    })
    screenshot: Attachment,
    @SlashOption({
      name: "player2",
      description: "Team member",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    player2: GuildMember,
    @SlashOption({
      name: "player3",
      description: "Team member",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player3: GuildMember | undefined,
    @SlashOption({
      name: "player4",
      description: "Team member",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player4: GuildMember | undefined,
    @SlashOption({
      name: "player5",
      description: "Team member",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player5: GuildMember | undefined,
    @SlashOption({
      name: "player6",
      description: "Team member",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player6: GuildMember | undefined,
    @SlashOption({
      name: "player7",
      description: "Team member",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player7: GuildMember | undefined,
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
    ].filter((m): m is GuildMember => m !== undefined);

    const seen = new Set<string>();
    const uniqueMembers = members.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });

    await caHelper(achievement, uniqueMembers, interaction, screenshot.url);
  }
}
