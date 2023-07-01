import {
    ApplicationCommandOptionType,
    CommandInteraction,
    GuildMember, Role,
} from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import IsAdmin from "../../guards/IsAdmin.js";
import eventHelper from "./func/eventHelper.js";
import eventRoleHelper from "./func/eventRoleHelper.js";

@Discord()
@SlashGroup({ name: "event", description: "Event specific commands" })
@SlashGroup("event")
@Guard(IsAdmin)
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
        return eventHelper(user, interaction, "event_participation");
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
        return eventHelper(user, interaction, "event_hosting");
    }

    @Slash({ name: "role", description: "Event point for a whole role" })
    async role(
        @SlashOption({
            name: "role",
            description: "Role for which to award points",
            required: true,
            type: ApplicationCommandOptionType.Role,
        })
        @SlashOption({
            name: "amount",
            description: "Amount of points to give",
            required: true,
            type: ApplicationCommandOptionType.Number,
        })
        role: Role,
        amount: number,
        interaction: CommandInteraction,
    ) {
        return eventRoleHelper(role, interaction, amount);
    }
}

