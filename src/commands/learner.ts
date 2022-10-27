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
@SlashGroup({ name: "learner", description: "Learner specific point commands" })
@SlashGroup("learner")
class Learner {
    @Slash({ name: "half", description: "Halved learner points" })
    async half(
        @SlashOption({
            name: "username",
            description: "Users discord profile",
            required: true,
            type: ApplicationCommandOptionType.User,
        })
        channel: GuildMember,
        interaction: CommandInteraction,
    ) {
        if (!IsAdmin(Number(interaction.member?.permissions))) return;

        let addedPoints = await pointsHandler(
            PointRewardsMap.get("learner_half"),
            interaction.guild!.id,
        );

        // Handle giving of points, returns a string to be sent as a message.
        await givePoints(addedPoints, channel, interaction);
    }

    @Slash({ name: "full", description: "Full learner points" })
    async full(
        @SlashOption({
            name: "username",
            description: "Users discord profile",
            required: true,
            type: ApplicationCommandOptionType.User,
        })
        channel: GuildMember,
        interaction: CommandInteraction,
    ) {
        if (!IsAdmin(Number(interaction.member?.permissions))) return;

        let addedPoints = await pointsHandler(
            PointRewardsMap.get("learner_full"),
            interaction.guild!.id,
        );

        // Handle giving of points and reply to interaction.
        await givePoints(addedPoints, channel, interaction);
    }
}
