import { Discord, Guard, Slash, SlashOption } from "discordx"
import {
    ApplicationCommandOptionType,
    CommandInteraction,
    GuildMember,
    InteractionReplyOptions,
} from "discord.js"
import IsAdmin from "../guards/IsAdmin.js"

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
        let request_url

        try {
            // Removes the user to the db
            warning.content = `Failed to remove user (**${user.displayName}**)`
            request_url = `${API}/user?guild_id=${interaction.guildId}&user_id=${user.id}`

            await fetch(request_url, { method: "DELETE" }).then((response) => {
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

        interaction.reply(`**${user.user}** has been deactivated.`)
    }
}
