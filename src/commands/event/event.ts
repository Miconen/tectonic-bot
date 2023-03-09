import {
    ApplicationCommandOptionType,
    CommandInteraction,
    GuildMember,
} from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import learnerHelper from "./func/eventHelper.js";
import womHelper from "./func/womHelper.js";

@Discord()
@SlashGroup({ name: "event", description: "Event specific commands" })
@SlashGroup("event")
class Event {
    @Slash({
        name: "participation",
        description: "Command for giving out event specific points",
    })
    async participation(
        @SlashOption({
            name: "username",
            description: "Participation point rewards",
            required: true,
            type: ApplicationCommandOptionType.User,
        })
        user: GuildMember,
        interaction: CommandInteraction,
    ) {
        return learnerHelper(user, interaction, "event_participation");
    }

    @Slash({ name: "hosting", description: "Event hosting specific command" })
    async hosting(
        @SlashOption({
            name: "username",
            description: "Event hosting point rewards",
            required: true,
            type: ApplicationCommandOptionType.User,
        })
        user: GuildMember,
        interaction: CommandInteraction,
    ) {
        return learnerHelper(user, interaction, "event_participation");
    }

    @Slash({ name: "wom", description: "Wise old man automation" })
    async wom(
        @SlashOption({
            name: "competition",
            description: "ID of the WOM competition",
            required: true,
            type: ApplicationCommandOptionType.Integer,
        })
        @SlashOption({
            name: "cutoff",
            description: "Cutoff for xp/kills to gaine points",
            required: true,
            type: ApplicationCommandOptionType.Integer,
        })
        competitionId: number,
        cutoff: number,
        interaction: CommandInteraction,
    ) {
        return womHelper(competitionId, interaction, cutoff);
    }
}
