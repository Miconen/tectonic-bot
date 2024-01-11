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
        let request_url

        try {
            // Add the user to the db
            warning.content = `Failed to add user (**${user.displayName}**)`
            request_url = `${API}/user?guild_id=${interaction.guild.id}&user_id=${user.id}`

            await fetch(request_url, { method: "POST" }).then((response) => {
                if (!response.ok) {
                    // `❌ **${user.displayName}** is already activated`
                    warning.content += ` : ${response.status}`

                    throw new Error("Bad response")
                }
            })

            // Add an rsn to the user
            request_url = `${API}/rsn?guild_id=${interaction.guild.id}&user_id=${user.id}&rsn=${rsn}`
            warning.content = `Failed to add RSN (**${rsn}**)`

            await fetch(request_url, { method: "POST" }).then((response) => {
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

        interaction.reply(
            `**${user.user}** has been activated and linked by **${interaction.member}**.`
        )
    }
}
