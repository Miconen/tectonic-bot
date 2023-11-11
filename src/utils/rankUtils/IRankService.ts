import { BaseInteraction, GuildMember, Role } from "discord.js"

interface IRankService {
    getIcon: (icon: string) => string
    addRole: (
        interaction: BaseInteraction,
        target: GuildMember,
        roleName: string
    ) => Promise<void>
    getRankByPoints: (points: number) => string
    pointsToNextRank: (points: number) => number
    rankUpHandler: (
        interaction: BaseInteraction,
        target: GuildMember,
        oldPoints: number,
        newPoints: number
    ) => Promise<string | undefined>
    rankUpdater: (oldPoints: number, newPoints: number) => string | false
    removeOldRoles: (target: GuildMember) => Promise<void>
    getRoleValue: (searchValue: string) => number | undefined
}

export default IRankService
