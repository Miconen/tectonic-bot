import { Discord, Guard, Slash, SlashOption } from "discordx"
import {
    ApplicationCommandOptionType,
    CommandInteraction,
    GuildMember,
    InteractionReplyOptions,
} from "discord.js"
import IsAdmin from "../guards/IsAdmin.js"

@Discord()
//@Guard(IsAdmin)
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
        let request_url

        try {
            // Removes the user to the db
            warning.content = `User (**${user.displayName}**) not activated`
            request_url = `${API}/user?guild_id=${interaction.guildId}&user_id=${user.id}`

            await fetch(request_url, { method: "GET" }).then((response) => {
                if (!response.ok) {
                    warning.content += ` : ${response.status}`
                    throw new Error("Bad response")
                }
            })
        } catch (error) {
            console.error(error)
            console.error(`Request failed\nRequest_url:\n`, request_url)
            interaction.reply(warning)
            return
        }

        interaction.reply(`**${user.user}** is activated.`)
    }
}
