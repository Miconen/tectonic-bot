import {
    ApplicationCommandOptionType,
    CommandInteraction,
    GuildMember,
} from "discord.js"
import {
    Discord,
    Guard,
    Slash,
    SlashChoice,
    SlashGroup,
    SlashOption,
} from "discordx"
import IsAdmin from "../../guards/IsAdmin.js"
import IsValidTime from "../../guards/IsValidTime.js"
import bossCategories from "./func/getBosses.js"
import submitHandler from "./func/submitHandler.js"

@Discord()
@SlashGroup("pb")
@Guard(IsAdmin, IsValidTime("time"))
class sepulchrepb {
    @Slash({
        name: "sepulchre",
        description: "Request your new pb to be added",
    })
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
        @SlashOption({
            name: "player",
            description: "Teammate discord @name",
            required: false,
            type: ApplicationCommandOptionType.User,
        })
        player: GuildMember | null
    ) {
        let team = [player?.user.id]

        await submitHandler(floor, time, team, interaction)
        await interaction.reply("Time added to database")
    }
}
