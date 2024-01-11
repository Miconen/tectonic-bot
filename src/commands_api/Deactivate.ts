import { Discord, Guard, Slash, SlashOption } from "discordx"
import {
    ApplicationCommandOptionType,
    CommandInteraction,
    GuildMember,
    InteractionReplyOptions,
} from "discord.js"
import IsAdmin from "../guards/IsAdmin.js"
import HttpStatus from "../utils/HTTPCodes.js"

@Discord()
@Guard(IsAdmin)
class Deactivate {
    @Slash({
        name: "deactivate",
        description:
            "Deactivate and remove all points/data entries associated with a user",
    })
    async Deactivate(
        @SlashOption({
            name: "username",
            description:
                "@User tag to deactivate, WARNING USERS POINTS WILL BE DELETED",
            required: true,
            type: ApplicationCommandOptionType.User,
        })
        user: GuildMember,
        interaction: CommandInteraction
    ) {
        if (!interaction.guild?.id) return

        let warning: InteractionReplyOptions = {
            content: "",
            ephemeral: true,
        }

        const API = process.env.API

        // Add the user to the db
        warning.content = `Failed to deactivate (**${user.displayName}**)`
        let request_url = `${API}/user?guild_id=${interaction.guild.id}&user_id=${user.id}`

        let response = await fetch(request_url, { method: "DELETE" })

        switch (response.status) {
            case HttpStatus.NO_CONTENT:
                warning.content += ``
                break
            case HttpStatus.BAD_REQUEST:
                warning.content += `(**${user.displayName}**) is not activated : ${response.status}`
                break
            case HttpStatus.NOT_FOUND:
                warning.content += `(**${user.displayName}**) is not activated : ${response.status}`
                break
            case HttpStatus.INTERNAL_SERVER_ERROR:
                warning.content += `api die ded : ${response.status}`
                break
            default:
                warning.content += `uncaught : ${response.status}`
                break
        }
        if (response.status > 400) {
            console.error(`Request failed\nRequest_url:\n`, request_url)
            interaction.reply(warning)
            return
        }

        interaction.reply(
            `**${user.user}** has been deactivated by **${interaction.member}**.`
        )
    }
}
