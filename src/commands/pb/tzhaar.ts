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
import IsActivated from "@guards/IsActivated.js"
import IsAdmin from "@guards/IsAdmin.js"
import IsValidTime from "@guards/IsValidTime.js"
import { replyHandler } from "@utils/replyHandler.js"
import bossCategories from "./func/getBosses.js"
import submitHandler from "./func/submitHandler.js"

@Discord()
@SlashGroup("pb")
@Guard(IsAdmin, IsValidTime("time"), IsActivated())
class tzhaarpb {
    @Slash({ name: "tzhaar", description: "Request your new pb to be added" })
    async slayer(
        @SlashChoice(...bossCategories["TzHaar"])
        @SlashOption({
            name: "boss",
            description: "Boss to submit time for",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        boss: string,
        @SlashOption({
            name: "time",
            description: "TzHaar pb time",
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
        let team = [player.user.id]

        await interaction.deferReply();
        let response = await submitHandler(boss, time, team, interaction)
        await replyHandler(response, interaction);
    }
}
