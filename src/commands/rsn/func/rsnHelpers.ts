import type { CommandInteraction, GuildMember } from "discord.js"
import type { Result } from "../../../typings/commandResult"
import { WOMClient } from "@wise-old-man/utils"
import { replyHandler } from "../../../utils/replyHandler.js"
import { Requests } from "@requests/main.js"

const wom = new WOMClient()

export async function addRsnHelper(
    user: GuildMember,
    rsn: string,
    interaction: CommandInteraction
) {
    if (!interaction.guild?.id) return

    await interaction.deferReply()

    // Attempt to find Wise Old Man id of given rsn
    let womId = await getWomId(rsn)
    if (!womId.success) {
        return await replyHandler(womId.error, interaction)
    }

    let response = `## ${user.displayName} RSNs\n`

    try {
        Requests.addRsn(
            interaction.guild.id,
            user.id,
            rsn,
            womId.value.toString()
        )
        let rsns = Requests.getUserRsns(interaction.guild.id, { type: "user_id", user_id: user.id })
        response += rsns.map((rsn) => `\`${rsn.rsn}\``).join("\n")
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
        let removed = Requests.removeRsn(
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

export async function getWomId(rsn: string): Promise<Result<number, string>> {
    try {
        let player = await wom.players.getPlayerDetails(rsn)
        let response = player.id
        return { success: true, value: response }
    } catch (e: unknown) {
        if (typeof e === "string") {
            console.error(e)
            let error = "Encountered an unknown error"
            return { success: false, error }
        }

        if (e instanceof Error && e.message === "Player not found.") {
            let error =
                "User could not be found, please check you typed the name correctly."
            return { success: false, error }
        }

        if (e instanceof Error) {
            let error = "Something wrong...\n**Error: **" + e.message
            return { success: false, error }
        }

        console.error(e)
        let error = "Something went catastrophically wrong :D"
        return { success: false, error }
    }
}
