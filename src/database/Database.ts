import { PrismaClient, teams, users } from "@prisma/client"
import { singleton } from "tsyringe"
import { GuildBoss, GuildCategory } from "../commands/pb/func/types"
import IDatabase from "./IDatabase"
import { GuildMember } from "discord.js"

@singleton()
export class Database implements IDatabase {
    private readonly prisma
    constructor() {
        this.prisma = new PrismaClient()
    }

    async getLeaderboard(guild_id: string) {
        return await this.prisma.users.findMany({
            take: 50,
            orderBy: [{ points: "desc" }],
            where: { guild_id },
        })
    }

    async getUser(guildId: string, userId: string) {
        return await this.prisma.users.findUnique({
            where: { ids: { user_id: userId, guild_id: guildId } },
        })
    }

    async newUser(guild_id: string, user_id: string) {
        // Return false if we didn't update
        if (await this.userExists(guild_id, user_id)) return false

        // Create new user
        await this.prisma.users.create({ data: { guild_id, user_id } })

        // Return true if updated
        return true
    }

    async removeUser(guild_id: string, user_id: string) {
        let response = await this.prisma.users.deleteMany({
            where: { guild_id, user_id },
        })

        return !!response.count
    }

    async userExists(guildId: string, userId: string) {
        let exists = await this.getUser(guildId, userId)
        return !!exists?.user_id
    }

    async usersExist(guild_id: string, user_ids: string[]) {
        return await this.prisma.users.findMany({
            where: { guild_id, user_id: { in: user_ids } },
        })
    }

    async getPoints(guildId: string, userId: string) {
        let response = await this.getUser(guildId, userId)
        return response?.points
    }

    async getPointMultiplier(guild_id: string) {
        let response = await this.prisma.guilds.findUnique({
            where: { guild_id },
        })
        return response?.multiplier
    }

    async setPointMultiplier(guild_id: string, multiplier: number) {
        let response = await this.prisma.guilds.upsert({
            where: { guild_id },
            update: { multiplier },
            create: { guild_id, multiplier },
        })
        return response.multiplier
    }

    async updateUserPoints(
        guild_id: string,
        user_id: string,
        incomingPoints: number
    ) {
        if (!(await this.userExists(guild_id, user_id))) return false
        await this.prisma.users.update({
            where: { ids: { guild_id, user_id } },
            data: { points: { increment: incomingPoints } },
        })
        let response = await this.getUser(guild_id, user_id)
        return response?.points
    }

    async getUsersPbs(guild_id: string, user_id: string) {
        return await this.prisma.times.findMany({
            where: {
                guild_bosses: {
                    some: {
                        pb_id: {
                            not: null,
                        },
                    },
                },
                teams: {
                    some: {
                        user_id,
                        guild_id,
                    },
                },
            },
            include: {
                guild_bosses: {
                    select: {
                        pb_id: true,
                        bosses: true,
                        guilds: {
                            select: {
                                guild_categories: {
                                    select: {
                                        categories: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })
    }

    async addTime(ticks: number, boss: string) {
        return await this.prisma.times.create({
            data: {
                time: ticks,
                boss_name: boss,
                date: new Date(),
            },
        })
    }

    async addTeam(teamData: teams[]) {
        await this.prisma.teams.createMany({
            data: teamData,
        })
        return
    }

    async getBosses() {
        return await this.prisma.bosses.findMany({
            orderBy: {
                category: "asc",
            },
        })
    }

    async getCategoriesWithBosses() {
        return await this.prisma.categories.findMany({
            include: {
                bosses: true,
            },
        })
    }

    async getGuildCategories(guild_id: string) {
        return this.prisma.guild_categories.findMany({
            where: {
                guild_id,
            },
        })
    }

    async getGuildBosses(guild_id: string) {
        return this.prisma.guild_bosses.findMany({
            where: {
                guild_id,
            },
        })
    }

    async getGuild(guild_id: string) {
        return this.prisma.guilds.findUnique({
            where: {
                guild_id,
            },
        })
    }

    async getOldPb(guild_id: string, boss: string) {
        return await this.prisma.guild_bosses.findUnique({
            where: {
                boss_guild_id: {
                    boss: boss,
                    guild_id,
                },
            },
            include: {
                times: true,
            },
        })
    }

    async updatePb(guild_id: string, boss: string, pb_id: number) {
        await this.prisma.guild_bosses.update({
            where: {
                boss_guild_id: {
                    boss: boss,
                    guild_id,
                },
            },
            data: {
                pb_id,
            },
        })

        return
    }

    async updatePbChannel(guild_id: string, channel_id: string) {
        await this.prisma.guilds.upsert({
            where: {
                guild_id: guild_id,
            },
            update: {
                pb_channel_id: channel_id,
            },
            create: {
                guild_id: guild_id,
                multiplier: 1,
                pb_channel_id: channel_id,
            },
        })
    }

    async getBoss(boss: string) {
        return await this.prisma.bosses.findUnique({
            where: { name: boss },
        })
    }

    async getCategoryByBoss(category: string) {
        return await this.prisma.bosses.findMany({
            where: { category: category },
            include: {
                guild_bosses: {
                    include: {
                        times: {
                            include: {
                                teams: true,
                            },
                        },
                    },
                },
            },
        })
    }

    async getEmbedData(guild_id: string, category: string) {
        return await this.prisma.guild_categories.findUnique({
            where: {
                guild_id_category: {
                    guild_id,
                    category: category,
                },
            },
            include: {
                guilds: true,
                categories: true,
            },
        })
    }

    async getGuildBossesPbs(guild_id: string) {
        return await this.prisma.guild_bosses.findMany({
            where: {
                guild_id: guild_id,
            },
            include: {
                times: {
                    include: {
                        teams: true,
                    },
                },
            },
        })
    }

    async ensureGuildBossesExist(data: GuildBoss[]) {
        await this.prisma.guild_bosses.createMany({
            data: data,
            skipDuplicates: true,
        })
    }

    async updateGuildCategories(guild_id: string, data: GuildCategory[]) {
        await this.prisma.guild_categories.deleteMany({
            where: {
                guild_id: guild_id,
            },
        })

        await this.prisma.guild_categories.createMany({
            data: data,
            skipDuplicates: true,
        })
    }

    async addRsn(
        guild_id: string,
        user_id: string,
        rsn: string,
        wom_id: string
    ) {
        await this.prisma.rsn.create({
            data: {
                guild_id: guild_id,
                user_id: user_id,
                rsn: rsn,
                wom_id: wom_id,
            },
        })
    }

    async removeRsn(guild_id: string, user_id: string, rsn: string) {
        let response = await this.prisma.rsn.deleteMany({
            where: {
                guild_id: guild_id,
                user_id: user_id,
                rsn: rsn,
            },
        })
        return !!response.count
    }

    async removeAllRsn(guild_id: string, user_id: string) {
        let response = await this.prisma.rsn.deleteMany({
            where: {
                guild_id: guild_id,
                user_id: user_id,
            },
        })
        return !!response.count
    }

    async getRsns(guild_id: string, user_id: string) {
        return await this.prisma.rsn.findMany({
            where: { guild_id, user_id },
        })
    }

    async getUsersByWomIds(guild_id: string, wom_id: string[]) {
        return await this.prisma.rsn.findMany({
            where: { guild_id, wom_id: { in: wom_id } },
        })
    }

    async getUserByRsn(guild_id: string, rsn: string) {
        const userId = await this.prisma.rsn.findFirst({
            where: {
                guild_id,
                rsn,
            },
            select: {
                user_id: true,
            },
        })

        return userId?.user_id;
    }
}
