import {
    ApplicationCommandOptionType,
    CommandInteraction,
    GuildMember,
} from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import updateUserPoints from "../data/database/updateUserPoints.js";
import pointsHandler, { PointRewardsMap } from "../data/pointHandling.js";
import { rankUpHandler } from "../data/roleHandling.js";
import IsAdmin from "../utility/isAdmin.js";

@Discord()
@SlashGroup({ name: "learner", description: "Learner specific point commands" })
class Learner {
    @Slash({ name: "half", description: "Halved learner points" })
    async half(
        @SlashOption({
            name: "username",
            description: "Users discord profile",
            type: ApplicationCommandOptionType.User,
        })
        channel: GuildMember,
        interaction: CommandInteraction,
    ) {
        if (!IsAdmin(Number(interaction.member?.permissions))) return;
        let points = await pointsHandler(
            PointRewardsMap.get("learner_half"),
            interaction.guild!.id,
        );
        let result = updateUserPoints(
            interaction.guild!.id,
            // @ts-ignore
            channel.user.id,
            points!,
        );
        let response = "Error giving points";
        result
            .then((res) => {
                if (Number.isInteger(res)) {
                    // @ts-ignore
                    response = `✔️ ${channel.user} was granted ${points} points by ${interaction.member} and now has a total of ${res} points.`;
                    rankUpHandler(interaction, channel, res - points, res);
                }
                if (res == false) {
                    // @ts-ignore
                    response = `❌ ${channel.user} Is not an activated user.`;
                }
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                interaction.reply(response);
            });
    }
    @Slash({ name: "full", description: "Full learner points" })
    async full(
        @SlashOption({
            name: "username",
            description: "Users discord profile",
            type: ApplicationCommandOptionType.User,
        })
        channel: GuildMember,
        interaction: CommandInteraction,
    ) {
        if (!IsAdmin(Number(interaction.member?.permissions))) return;
        let points = await pointsHandler(
            PointRewardsMap.get("learner_full"),
            interaction.guild!.id,
        );
        let result = updateUserPoints(
            interaction.guild!.id,
            // @ts-ignore
            channel.user.id,
            points!,
        );
        let response = "Error giving points";
        result
            .then((res) => {
                if (Number.isInteger(res)) {
                    // @ts-ignore
                    response = `✔️ ${channel.user} was granted ${points} points by ${interaction.member} and now has a total of ${res} points.`;
                    rankUpHandler(interaction, channel, res - points, res);
                }
                if (res == false) {
                    // @ts-ignore
                    response = `❌ ${channel.user} Is not an activated user.`;
                }
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                interaction.reply(response);
            });
    }
}

