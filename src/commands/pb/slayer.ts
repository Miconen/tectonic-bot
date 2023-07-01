import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Guard, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import IsValidTime from "../../guards/IsValidTime.js";
import bossCategories from "./func/getBosses.js";
import submitHandler from "./func/submitHandler.js";

@Discord()
@SlashGroup("pb")
@Guard(IsValidTime("time"))
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
        let team = [
            interaction.user.id,
        ];

        await submitHandler(boss, time, team, interaction);
    }
}
