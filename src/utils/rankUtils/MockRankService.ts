import IRankService from "@utils/rankUtils/IRankService";
import { BaseInteraction, CacheType, GuildMember } from "discord.js";
import { singleton } from "tsyringe";

@singleton()
export class MockRankService implements IRankService {
    public readonly ironmanIcon: Map<string, string>
    public readonly rankIcon: Map<string, string>
    public readonly roleIds: Map<string, string>
    public readonly roleValues: Map<number, string>

    constructor() {
        this.ironmanIcon = new Map([
            ["MAIN", "( Main )"],
            ["IM", "( Ironman )"],
            ["HCIM", "( Hardcore Ironman )"],
            ["UIM", "( Ultimate Ironman )"],
            ["GIM", "( Group Ironman )"],
            ["HCGIM", "( Group Hardcore Ironman )"],
        ])

        this.rankIcon = new Map([
            ["jade", "( Jade )"],
            ["red_topaz", "( Red Topaz )"],
            ["sapphire", "( Sapphire )"],
            ["emerald", "( Emerald )"],
            ["ruby", "( Ruby )"],
            ["diamond", "( Diamond )"],
            ["dragonstone", "( Dragonstone )"],
            ["onyx", "( Onyx )"],
            ["zenyte", "( Zenyte )"],
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
        return newRank
    }

    // Returns new if there is one, returns false if no rank up happened
    public rankUpdater(oldPoints: number, newPoints: number) {
        const oldRank = this.getRankByPoints(oldPoints)
        const newRank = this.getRankByPoints(newPoints)
        return oldRank != newRank ? newRank : false
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

    async removeOldRoles (target: GuildMember) {
        return;
    } 

    async addRole(interaction: BaseInteraction<CacheType>, target: GuildMember, roleName: string) {
        return;
    }
}
