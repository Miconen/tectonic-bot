import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import bossCategories from "./func/getBosses.js";

@Discord()
@SlashGroup("pb")
class slayerpb {
    @Slash({ name: "slayer", description: "Request your new pb to be added" })
    async slayer(
        @SlashChoice(...bossCategories["Slayer Boss"])
        @SlashOption({
            name: "boss",
            description: "Boss to submit time for",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        boss: string,
        @SlashOption({
            name: "time",
            description: "Slayer pb time",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        time: string,
        interaction: CommandInteraction,
    ) {
        await interaction.reply(time);
    }
}
