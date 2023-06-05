import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import bossCategories from "./func/getBosses.js";

@Discord()
@SlashGroup("pb")
class sepulchrepb {
    @Slash({ name: "sepulchre", description: "Request your new pb to be added" })
    async sepulchre(
        @SlashChoice(...bossCategories["Sepulchre"])
        @SlashOption({
            name: "floor",
            description: "Floor to submit time for",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        floor: string,
        @SlashOption({
            name: "time",
            description: "Hallowed Sepulchre pb time",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        time: string,
        interaction: CommandInteraction,
    ) {
        await interaction.reply(time);
    }
}
