import IDatabase from "@database/IDatabase";
import { users, categories, bosses, guild_bosses, guild_categories } from "@prisma/client";
import { singleton } from "tsyringe";

@singleton()
export class MockDatabase implements IDatabase {
    private users: users[] = [];
    private guildBosses: Record<string, guild_bosses[]> = {}
    private guildCategories: Record<string, guild_categories[]> = {}
    private categories: Record<string, categories> = {}
    private bosses: Record<string, bosses> = {}
    private points: Record<string, Record<string, number>> = {}
    private multiplier = 1

    // Clear all data from the mock database
    reset(): void {
        this.users = []
        this.guildBosses = {}
        this.guildCategories = {}
        this.categories = {}
        this.bosses = {}
        this.points = {}
        this.multiplier = 1
    }

    async getLeaderboard(guild_id: string) {
        return this.users;
    }

    async getUser(guildId: string, userId: string) {
        return this.users[0]
    }

    async newUser(guild_id: string, user_id: string) {
        let exists = await this.userExists(guild_id, user_id)

        // Return false if we didn't update
        if (exists) return false

        this.users.push({
            user_id: user_id,
            guild_id: guild_id,
            points: 0,
        })

        // Return true if updated
        return true
    }

    async removeUser(guild_id: string, user_id: string) {
        let exists = await this.userExists(guild_id, user_id)

        if (exists) {
            this.users = this.users.filter(user => user.user_id !== user_id)
        }

        return exists
    }

    async userExists(guildId: string, userId: string) {
        return this.users.some(user => user.user_id === userId)
    }

    async usersExist(guild_id: string, user_ids: string[]) {
        return await this.prisma.users.findMany({
            where: { guild_id, user_id: { in: user_ids } },
        })
    }

    async getPoints(guildId: string, userId: string) {
        return this.users.find(user => user.user_id === userId)?.points
    }

    async getPointMultiplier(guild_id: string) {
        return this.multiplier
    }

    async setPointMultiplier(guild_id: string, multiplier: number) {
        this.multiplier = multiplier
        return multiplier
    }

    async updateUserPoints(
        guild_id: string,
        user_id: string,
        incomingPoints: number
    ) {
        let user = this.users.find(user => user.user_id === user_id)
        if (user) {
            user.points += incomingPoints
        }
        return user?.points
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

    async addRsn(guild_id: string, user_id: string, rsn: string, wom_id: string) {
        await this.prisma.rsn.create({
            data: {
                guild_id: guild_id,
                user_id: user_id,
                rsn: rsn,
                wom_id: wom_id
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
        return !!response.count;
    }

    async removeAllRsn(guild_id: string, user_id: string) {
        let response = await this.prisma.rsn.deleteMany({
            where: {
                guild_id: guild_id,
                user_id: user_id,
            },
        })
        return !!response.count;
    }

    async getRsns(guild_id: string, user_id: string) {
        return await this.prisma.rsn.findMany({
            where: { guild_id, user_id },
        })
    }

    async getUsersByWomIds(guild_id: string, wom_id: string[]) {
        return await this.prisma.rsn.findMany({
            where: { guild_id, wom_id: { in: wom_id } }
        })
    }
}

export default MockDatabase
