import { BaseInteraction, GuildMember, RoleResolvable } from "discord.js"
import { singleton } from "tsyringe"
import IRankService from "./IRankService"

@singleton()
export class RankService implements IRankService {
    public readonly ironmanIcon: Map<string, string>
    public readonly rankIcon: Map<string, string>
    public readonly roleValues: Map<number, string>

    constructor() {
        this.ironmanIcon = new Map([
            ["MAIN", ""],
            ["IM", "<:IM:990015824981020702>"],
            ["HCIM", "<:HCIM:990015822376366140>"],
            ["UIM", "<:UIM:990015823651422238>"],
            ["GIM", "<:GIM:990015820568592434>"],
            ["HCGIM", "<:HCGIM:990015818924429312>"],
        ])

        this.rankIcon = new Map([
            ["jade", "989916229588365384"],
            ["red_topaz", "989916991164928031"],
            ["sapphire", "989917487829229600"],
            ["emerald", "989917954424578058"],
            ["ruby", "989918030446346290"],
            ["diamond", "989918133500403713"],
            ["dragonstone", "989918207735377952"],
            ["onyx", "989917139836235826"],
            ["zenyte", "989917779928940585"],
        ])

        this.roleValues = new Map([
            [0, "jade"],
            [50, "red_topaz"],
            [100, "sapphire"],
            [200, "emerald"],
            [400, "ruby"],
            [600, "diamond"],
            [800, "dragonstone"],
            [1000, "onyx"],
            [1250, "zenyte"],
        ])
    }

    public async rankUpHandler(
        interaction: BaseInteraction,
        target: GuildMember,
        oldPoints: number,
        newPoints: number
    ) {
        // Determine if user received a new rank
        let newRank = this.rankUpdater(oldPoints, newPoints)
        // If no new rank then return
        if (!newRank) return
        // Remove old roles before adding new one
        await this.removeOldRoles(target)
        await this.addRole(interaction, target, newRank)
        return newRank
    }

    // Returns new if there is one, returns false if no rank up happened
    public rankUpdater(oldPoints: number, newPoints: number) {
        const oldRank = this.getRankByPoints(oldPoints)
        const newRank = this.getRankByPoints(newPoints)
        return oldRank != newRank ? newRank : false
    }

    public async removeOldRoles(target: GuildMember) {
        const oldRoles = target.roles.cache.filter((role) =>
            this.getRoleValueByName(role.id)
        )
        if (oldRoles.size === 0) return
        await target.roles.remove(oldRoles)
    }

    public getRankByPoints(points: number) {
        const rank = [...this.roleValues.entries()]
            .reverse()
            .find(([key]) => points >= key)
        return rank ? rank[1] : [...this.roleValues.values()][0]
    }

    public pointsToNextRank(points: number) {
        const nextRank = [...this.roleValues.entries()].find(
            ([minPoints]) => minPoints > points
        )
        return nextRank ? nextRank[0] - points : -1
    }

    public async addRole(
        interaction: BaseInteraction,
        target: GuildMember,
        roleName: string
    ) {
        let role = this.getRole(interaction, roleName)
        if (role == undefined) return
        await target.roles.add(role as RoleResolvable)
    }

    public getRole(interaction: BaseInteraction, roleName: string) {
        let guild = interaction.guild
        if (!guild) return
        if (guild.id != "979445890064470036") return undefined
        let roleId = this.rankIcon.get(roleName) ?? "0"
        return guild.roles.cache.get(roleId)
    }

    public getRoleValueByName(searchValue: string) {
        return this.getByValue(this.roleValues, searchValue)
    }

    private getByValue<TKey, TValue>(
        map: Map<TKey, TValue>,
        searchValue: string
    ) {
        for (let [key, value] of map.entries()) {
            if (value === searchValue) return key
        }
        return
    }
}
