import { CommandInteraction, GuildMember, RoleResolvable } from "discord.js"

const addDefaultRole = async (interaction: CommandInteraction, target: GuildMember) => {
    let guild = interaction.guild
    let member = target
    let role = guild?.roles.cache.get("989916229588365384")
    await member.roles.add(role as RoleResolvable)
}

export { addDefaultRole }