import { BaseInteraction, GuildMember, Role } from "discord.js"

interface IRankService {
    getIcon: (icon: string) => string
    addRole: (
        interaction: BaseInteraction,
        target: GuildMember,
        roleName: string
    ) => Promise<void>
    getRankByPoints: (points: number) => string
    getRole: (
        interaction: BaseInteraction,
        roleName: string
    ) => Role | undefined
    pointsToNextRank: (points: number) => number
    rankUpHandler: (
        interaction: BaseInteraction,
        target: GuildMember,
        oldPoints: number,
        newPoints: number
    ) => Promise<string | undefined>
    rankUpdater: (oldPoints: number, newPoints: number) => string | false
    removeOldRoles: (target: GuildMember) => Promise<void>
    getRoleValueByName: (searchValue: string) => number | undefined
}

export default IRankService
