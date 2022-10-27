import {
    ApplicationCommandOptionType,
    CommandInteraction,
    GuildMember,
} from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import pointsHandler, { PointRewardsMap } from "../data/pointHandling.js";
import IsAdmin from "../utility/isAdmin.js";
import givePoints from "../utility/givePoints.js";

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

        let addedPoints = await pointsHandler(
            PointRewardsMap.get("event_hosting"),
            interaction.guild!.id,
        );

        // Handle giving of points and reply to interaction.
        await givePoints(addedPoints, channel, interaction);
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

        let addedPoints = await pointsHandler(
            PointRewardsMap.get("event_hosting"),
            interaction.guild!.id,
        );

        // Handle giving of points and reply to interaction.
        await givePoints(addedPoints, channel, interaction);
    }
}
