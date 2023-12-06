import {
    bosses,
    categories,
    guilds,
    guild_bosses,
    guild_categories,
    rsn,
    teams,
    times,
    users,
} from "@prisma/client"
import { GuildBoss, GuildCategory } from "../commands/pb/func/types"
import { GuildMember } from "discord.js"

type UsersPbs = (times & {
    guild_bosses: {
        guilds: {
            guild_categories: {
                categories: categories
            }[]
        }
        bosses: bosses
        pb_id: number | null
    }[]
})[]

type CategoryWithTimes = (bosses & {
    guild_bosses: (guild_bosses & {
        times:
        | (times & {
            teams: teams[]
        })
        | null
    })[]
})[]

type BossesWithTimes = (guild_bosses & {
    times:
    | (times & {
        teams: teams[]
    })
    | null
})[];

type CategoriesWithBosses = (categories & { bosses: bosses[] })[]
type OldPb = (guild_bosses & { times: times | null }) | null
type EmbedData = (guild_categories & {
    categories: categories,
    guilds: guilds,
}) | null;
type user_id = ({ user_id: string; } | null)

interface IDatabase {
    getLeaderboard: (guild_id: string) => Promise<users[]>

    getPointMultiplier: (guild_id: string) => Promise<number | undefined>
    setPointMultiplier: (
        guild_id: string,
        multiplier: number
    ) => Promise<number>
    getPoints: (
        guild_id: string,
        user_id: string
    ) => Promise<number | undefined>

    updateUserPoints: (
        guild_id: string,
        user_id: string,
        incomingPoints: number
    ) => Promise<number | false | undefined>
    userExists: (guild_id: string, userId: string) => Promise<boolean>
    usersExist: (guild_id: string, userIds: string[]) => Promise<users[]>
    getUser: (guild_id: string, userId: string) => Promise<users | null>
    newUser: (guild_id: string, user_id: string) => Promise<boolean>
    removeUser: (guild_id: string, user_id: string) => Promise<boolean>

    getUsersPbs: (guild_id: string, user_id: string) => Promise<UsersPbs>
    getOldPb: (guild_id: string, boss: string) => Promise<OldPb>
    updatePb: (guild_id: string, boss: string, pb_id: number) => Promise<void>
    updatePbChannel: (guild_id: string, channel_id: string) => Promise<void>

    addTime: (ticks: number, boss: string) => Promise<times>
    addTeam: (teamData: teams[]) => Promise<void>

    getCategoriesWithBosses: () => Promise<CategoriesWithBosses>
    getCategoryByBoss: (category: string) => Promise<CategoryWithTimes>
    getGuildCategories: (guild_id: string) => Promise<guild_categories[]>
    getBosses: () => Promise<bosses[]>
    getBoss: (boss: string) => Promise<bosses | null>
    getGuildBosses: (guild_id: string) => Promise<guild_bosses[]>
    getGuildBossesPbs: (guild_id: string) => Promise<BossesWithTimes>
    getGuild: (guild_id: string) => Promise<guilds | null>
    getEmbedData: (guild_id: string, category: string) => Promise<EmbedData>
    ensureGuildBossesExist: (data: GuildBoss[]) => Promise<void>
    updateGuildCategories: (guild_id: string, data: GuildCategory[]) => Promise<void>

    addRsn: (guild_id: string, user_id: string, rsn: string, wom_id: string) => Promise<void>
    removeRsn: (guild_id: string, user_id: string, rsn: string) => Promise<boolean>
    removeAllRsn: (guild_id: string, user_id: string) => Promise<boolean>
    getRsns: (guild_id: string, user_id: string) => Promise<rsn[]>

    getUsersByWomIds: (guild_id: string, wom_id: string[]) => Promise<rsn[]>
    getUserByRsn: (guild_id: string, rsn: string) => Promise<user_id>
}

export default IDatabase
