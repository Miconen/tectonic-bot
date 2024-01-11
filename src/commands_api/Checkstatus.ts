import { Discord, Guard, Slash, SlashOption } from "discordx"
import {
    ApplicationCommandOptionType,
    CommandInteraction,
    GuildMember,
    InteractionReplyOptions,
} from "discord.js"
import HttpStatus from "../utils/HTTPCodes.js"
@Discord()
class Checkstatus {
    @Slash({
        name: "checkstatus",
        description: "Checks if a user is activated or not",
    })
    async Checkstatus(
        @SlashOption({
            name: "username",
            description: "@User tag to check",
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

        warning.content = `User (**${user.displayName}**) not activated`
        let request_url: string = `${API}/user?guild_id=${interaction.guildId}&user_id=${user.id}`

        let response = await fetch(request_url, { method: "GET" })

        switch (response.status) {
            case 200:
                warning.content = ``
                break
            case 400:
                warning.content = `(**${user.displayName}**) is not activated : ${response.status}`
                break
            case 404:
                warning.content = `(**${user.displayName}**) is not activated : ${response.status}`
                break
            case 500:
                warning.content = `api die ded : ${response.status}`
                break
            default:
                warning.content = `uncaught : ${response.status}`
                break
        }
        if (response.status > 400) {
            console.error(`Request failed\nRequest_url:\n`, request_url)
            interaction.reply(warning)
            return
        }

        interaction.reply(`**${user.user}** is activated.`)
    }
}
