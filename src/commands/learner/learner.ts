import {
    ApplicationCommandOptionType,
    CommandInteraction,
    GuildMember,
} from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import learnerHelper from "./func/learnerHelper";

@Discord()
@SlashGroup({ name: "learner", description: "Learner specific point commands" })
@SlashGroup("learner")
class Learner {
    @Slash({ name: "half", description: "Halved learner points" })
    half(
        @SlashOption({
            name: "username",
            description: "Users discord profile",
            required: true,
            type: ApplicationCommandOptionType.User,
        })
        user: GuildMember,
        interaction: CommandInteraction,
    ) {
        return learnerHelper(user, interaction, "learner_half");
    }

    @Slash({ name: "full", description: "Full learner points" })
    async full(
        @SlashOption({
            name: "username",
            description: "Users discord profile",
            required: true,
            type: ApplicationCommandOptionType.User,
        })
        user: GuildMember,
        interaction: CommandInteraction,
    ) {
        return learnerHelper(user, interaction, "learner_full");
    }
}
