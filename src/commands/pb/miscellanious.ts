import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import bossCategories from "./func/getBosses.js";

@Discord()
@SlashGroup("pb")
class miscellaneouspb {
    @Slash({ name: "miscellaneous", description: "Request your new pb to be added" })
    async miscellaneous(
        @SlashChoice(...bossCategories["Miscellaneous"])
        @SlashOption({
            name: "boss",
            description: "Boss to submit time for",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        boss: string,
        @SlashOption({
            name: "time",
            description: "Miscellaneous boss pb time",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        time: string,
        interaction: CommandInteraction,
    ) {
        await interaction.reply(time);
    }
}
