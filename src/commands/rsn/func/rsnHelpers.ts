import type { CommandInteraction, GuildMember } from "discord.js"
import { replyHandler } from "../../../utils/replyHandler.js"
import { Requests } from "@requests/main.js"

export async function addRsnHelper(
    user: GuildMember,
    rsn: string,
    interaction: CommandInteraction
) {
    if (!interaction.guild?.id) return

    await interaction.deferReply()

    let response = `## ${user.displayName} RSNs\n`

    try {
        await Requests.addRsn(
            interaction.guild.id,
            user.id,
            rsn,
        )
        let rsns = await Requests.getUser(interaction.guild.id, { type: "user_id", user_id: user.id })
        if (rsns.error) {
            let error = `Failed to fetch RSN (**${rsn}**)`
            return await replyHandler(error, interaction)
        }
        response += rsns.data.rsns.map((rsn) => `\`${rsn.rsn}\``).join("\n")
    } catch (e) {
        let error = `Failed to add RSN (**${rsn}**), is the user (**${user.displayName}**) activated?`
        return await replyHandler(error, interaction)
    }

    return await replyHandler(response, interaction)
}

export async function removeRsnHelper(
    user: GuildMember,
    rsn: string,
    interaction: CommandInteraction
) {
    if (!interaction.guild?.id) return

    await interaction.deferReply()

    let response = ""
    try {
        let removed = await Requests.removeRsn(
            interaction.guild.id,
            user.id,
            rsn
        )
        if (removed) {
            response = `Removed RSN (**${rsn}**) from **${user.displayName}**`
        } else {
            response = `Couldn't find RSN (**${rsn}**) linked to **${user.displayName}**`
        }
    } catch (e) {
        let error = `Failed to remove (**${rsn}**), is the user (**${user.displayName}**) activated?`
        return await replyHandler(error, interaction)
    }

    return await replyHandler(response, interaction)
}
