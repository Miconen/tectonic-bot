import {
    CommandInteraction,
    GuildMember,
    InteractionReplyOptions,
} from "discord.js"
import { GuardFunction } from "discordx"
import { Requests } from "@requests/main.js"

function IsActivated(target: string = "player") {
    const guard: GuardFunction<CommandInteraction> = async (
        interaction,
        _,
        next
    ) => {
        console.log(`Checking if all players are activated`)

        let players: GuildMember[] = []

        // Dirty hack to extract GuildMembers from the guarded commands options
        interaction.options.data[0].options?.forEach((option) => {
            if (
                option.name.includes(target) &&
                option.member &&
                option.member instanceof GuildMember
            ) {
                console.log("option was guild member")
                players.push(option.member)
            } else if (option.name.includes(target)) {
                console.error(
                    "### Something went wrong with IsActivated guard finding GuildMembers ###"
                )
            }
        })

        if (!players.length) {
            console.log("↳ Error retrieving players")
            const warning: InteractionReplyOptions = {
                content: "Failed to fetch players from command",
                ephemeral: true,
            }
            return await interaction.reply(warning)
        } else {
            console.log("↳ Players list populated")
        }

        if (!interaction.guild?.id) {
            console.log("↳ Error getting guild ID")
            const warning: InteractionReplyOptions = {
                content: "Failed to fetch guild id",
                ephemeral: true,
            }
            return await interaction.reply(warning)
        }

        const playersUserIds = players.map((member) => member.id)
        const playersUserNames = players.map(
            (member) => `${member.displayName}`
        )
        console.log(
            `Checking activation statuses for: ${playersUserNames.join(", ")}`
        )

        let existingUsers = Requests.getUsers(interaction.guild.id, { type: "user_id", user_id: playersUserIds })

        let warning = ""

        for (const member of players) {
            const userExists = existingUsers.some(
                (user) => user.user_id === member.id
            )
            if (!userExists) {
                console.log(`↳ Denied, not activated: ${member.displayName}`)
                warning += `❌ **${member.displayName}** is not activated.\n`
            }
        }

        if (warning) {
            console.log(warning)
            return await interaction.reply("## Could not submit pb\n" + warning)
        }

        console.log("↳ Passed")
        await next()
    }

    return guard
}

export default IsActivated
