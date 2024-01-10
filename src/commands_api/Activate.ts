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
        const API = process.env.API
        var warning: InteractionReplyOptions = {
            content: "",
            ephemeral: true,
        }

        var error_mesasge = `An error occured`
        var request_body = {}
        var response: Response = new Response()
        //verify guild is activated
        //TODO: this is stupid
        if (!interaction.guild?.id) {
            warning.content = "Failed to fetch guild id"
            interaction.reply(warning)
            return
        }

        try {
            // Add the user to the db
            warning.content = `Failed to add user (**${user.displayName}**) Status: ${response.status} ${response.statusText}`
            error_mesasge = `Error making POST request to ${API}/user.`
            request_body = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    guild_id: interaction.guildId,
                    user_id: user.id,
                }),
            }

            await fetch(`${API}/user`).then((response) => {
                if (!response.ok) {
                    // `❌ **${user.displayName}** is already activated`
                    // TODO: figure out what can cause this error on the api side and what to repply

                    warning.content = `Status: ${response.status} ${response.statusText}`
                    response.json().then((bodyText) => {
                        error_mesasge =
                            warning.content + bodyText
                                ? JSON.stringify(bodyText)
                                : "{}"
                    })
                    throw new Error("Bad responce")
                }
            })

            // Add an rsn to the user
            // Update the warning in case operation fails
            warning.content = `Failed to add RSN (**${rsn}**) Status: ${response.status} ${response.statusText}`
            error_mesasge = `Error making POST request to ${API}/rsn.`
            request_body = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    guild_id: interaction.guildId,
                    user_id: user.id,
                    rsn: rsn,
                }),
            }

            await fetch(`${API}/rsn`, request_body).then(async (response) => {
                if (!response.ok) {
                    warning.content = `Status: ${response.status} ${response.statusText} `
                    response.json().then((bodyText) => {
                        error_mesasge =
                            warning.content + bodyText
                                ? JSON.stringify(bodyText)
                                : "{}"
                    })
                    throw new Error("Bad responce")
                }
            })
        } catch (error) {
            console.error(error)
            console.error(`Error message:\n`, error_mesasge)
            console.error(`request_body:\n`, request_body)

            interaction.reply(warning)
            return
        }

        interaction.reply(
            `**${user.user}** has been activated and linked by **${interaction.member}**.`
        )
    }
}
