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
class miscellaneouspb {
    @Slash({
        name: "miscellaneous",
        description: "Request your new pb to be added",
    })
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
        @SlashOption({
            name: "player",
            description: "Player discord @name",
            required: true,
            type: ApplicationCommandOptionType.User,
        })
        player: GuildMember,
        interaction: CommandInteraction,
    ) {
        let team = [player?.user.id]

        await submitHandler(boss, time, team, interaction)
        await interaction.reply("Time added to database")
    }
}
