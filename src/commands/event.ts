import {
    ApplicationCommandOptionType,
    CommandInteraction,
    GuildMember,
} from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import * as pointUtils from "../utility/pointUtils/index.js";
import IsAdmin from "../utility/isAdmin.js";

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
        channel: GuildMember,
        interaction: CommandInteraction,
    ) {
        if (!IsAdmin(Number(interaction.member?.permissions))) return;

        let addedPoints = await pointUtils.pointsHandler(
            pointUtils.pointRewards.get("event_participation"),
            interaction.guild!.id,
        );

        // Handle giving of points and reply to interaction.
        await pointUtils.givePoints(addedPoints, channel, interaction);
    }

    @Slash({ name: "hosting", description: "Event hosting specific command" })
    async hosting(
        @SlashOption({
            name: "username",
            description: "Event hosting point rewards",
            required: true,
            type: ApplicationCommandOptionType.User,
        })
        channel: GuildMember,
        interaction: CommandInteraction,
    ) {
        if (!IsAdmin(Number(interaction.member?.permissions))) return;

        let addedPoints = await pointUtils.pointsHandler(
            pointUtils.pointRewards.get("event_hosting"),
            interaction.guild!.id,
        );

        // Handle giving of points and reply to interaction.
        await pointUtils.givePoints(addedPoints, channel, interaction);
    }
}
