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
class Activate {
    @Slash({
        name: "activate",
        description:
            "Used for activating new guild members and giving access to rank points",
    })
    async Activate(
        @SlashOption({
            name: "username",
            description: "@User tag to activate",
            required: true,
            type: ApplicationCommandOptionType.User,
        })
        user: GuildMember,
        @SlashOption({
            name: "rsn",
            description: "RSN to add",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        rsn: string,
        interaction: CommandInteraction
    ) {
        if (!interaction.guild?.id) return

        let warning: InteractionReplyOptions = {
            content: "",
            ephemeral: true,
        }

        const API = process.env.API

        // Add the user to the db
        warning.content = `Failed to activate (**${user.displayName}**)`
        let request_url = `${API}/user?guild_id=${interaction.guild.id}&user_id=${user.id}&rsn=${rsn}`

        let response = await fetch(request_url, { method: "POST" })

        switch (response.status) {
            case HttpStatus.OK:
                warning.content = ``
                break
            case HttpStatus.BAD_REQUEST:
                warning.content = `(**${rsn}**) is invalid : ${response.status}`
                break
            case HttpStatus.NOT_FOUND:
                warning.content = `(**${user.displayName}**) is all ready activated or **${rsn}**) already in use : ${response.status}`
                break
            case HttpStatus.INTERNAL_SERVER_ERROR:
                warning.content = `api die ded : ${response.status}`
                break
            default:
                warning.content = `uncaught : ${response.status}`
                break
        }
        if (!response.ok) {
            console.error(`Request failed\nRequest_url:\n`, request_url)
            interaction.reply(warning)
            return
        }

        interaction.reply(
            `**${user.user}** has been activated by **${interaction.member}**.`
        )
    }
}
