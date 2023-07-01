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
import getBoss from "./func/getBoss.js"
import bossCategories from "./func/getBosses.js"
import submitHandler from "./func/submitHandler.js"

@Discord()
@SlashGroup("pb")
@Guard(IsAdmin, IsValidTime("time"))
class nightmarepb {
    @Slash({
        name: "nightmare",
        description: "Request your new pb to be added",
    })
    async nightmare(
        @SlashChoice(...bossCategories["Nightmare"])
        @SlashOption({
            name: "boss",
            description: "Boss to submit time for",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        boss: string,
        @SlashOption({
            name: "time",
            description: "Nightmare pb time",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        time: string,
        @SlashOption({
            name: "player1",
            description: "Player discord @name",
            required: true,
            type: ApplicationCommandOptionType.User,
        })
        player1: GuildMember,
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
        interaction: CommandInteraction
    ) {
        let team = [
            player1?.user.id,
            player2?.user.id,
            player3?.user.id,
            player4?.user.id,
            player5?.user.id,
        ]

        await submitHandler(getBoss("nm", team), time, team, interaction)
        await interaction.reply("Time added to database")
    }
}
