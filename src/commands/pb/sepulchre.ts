import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Guard, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import IsValidTime from "../../guards/IsValidTime.js";
import bossCategories from "./func/getBosses.js";

@Discord()
@SlashGroup("pb")
@Guard(IsValidTime("time"))
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
        await interaction.reply("Time added to database");
    }
}
