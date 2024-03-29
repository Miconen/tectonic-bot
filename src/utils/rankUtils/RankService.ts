import { BaseInteraction, Guild, GuildMember, RoleResolvable } from "discord.js"
import { singleton } from "tsyringe"
import IRankService from "./IRankService"

@singleton()
export class RankService implements IRankService {
    public readonly ironmanIcon: Map<string, string>
    public readonly rankIcon: Map<string, string>
    public readonly roleIds: Map<string, string>
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
            ["jade", "<:Jade:1167823880358989936>"],
            ["red_topaz", "<:Red_Topaz:1167823883580215387>"],
            ["sapphire", "<:Sapphire:1167823887489318972>"],
            ["emerald", "<:Emerald:1167823879205552138>"],
            ["ruby", "<:Ruby:1167823885530570872>"],
            ["diamond", "<:Diamond:1167823870556909629>"],
            ["dragonstone", "<:Dragonstone:1167823873266438214>"],
            ["onyx", "<:Onyx:1167823881403379743>"],
            ["zenyte", "<:Zenyte:1167823889636806677>"],
            ["astral", "<:Astral:1193279921242509383>"],
            ["death", "<:Death:1193279997868245022>"],
            ["blood", "<:Blood:1193279948899766342>"],
            ["soul", "<:Soul:1193279967396634686>"],
            ["wrath", "<:Wrath:1193279983725068398>"],
        ])

        this.roleIds = new Map([
            ["jade", "989916229588365384"],
            ["red_topaz", "989916991164928031"],
            ["sapphire", "989917487829229600"],
            ["emerald", "989917954424578058"],
            ["ruby", "989918030446346290"],
            ["diamond", "989918133500403713"],
            ["dragonstone", "989918207735377952"],
            ["onyx", "989917139836235826"],
            ["zenyte", "989917779928940585"],
            ["astral", "1190821065899913236"],
            ["death", "1190838725790400564"],
            ["blood", "1190825155761553519"],
            ["soul", "1190827045366796490"],
            ["wrath", "1190827085648908338"],
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
            [1500, "astral"],
            [2000, "death"],
            [2750, "blood"],
            [3750, "soul"],
            [5000, "wrath"],
        ])
    }

    public getIcon(icon: string) {
        return this.rankIcon.get(icon) ?? ""
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
        // const oldRoles = target.roles.cache.filter((role) => {
        //     this.getByValue(this.roleIds, role.id);
        // })
        // if (oldRoles.size === 0) return
        console.log(`↳ Removing all rank roles if possible from: ${target.displayName}`)
        const roles = [...this.roleIds.values()] as RoleResolvable[];
        await target.roles.remove(roles)
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
        if (!interaction.guild) return;
        let role = this.getRole(interaction.guild, roleName)
        if (role == undefined) return
        console.log(`↳ Adding new role to ${target.displayName} (${role.name})`)
        await target.roles.add(role as RoleResolvable)
    }

    private getRole(guild: Guild, roleName: string) {
        if (guild.id != "979445890064470036") return undefined
        let roleId = this.roleIds.get(roleName)
        if (!roleId) return undefined;
        return guild.roles.cache.get(roleId)
    }

    public getRoleValue(searchValue: string) {
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
