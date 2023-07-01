import {
    ApplicationCommandOptionType,
    CommandInteraction,
    GuildMember,
} from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import IsAdmin from "../../guards/IsAdmin.js";
import learnerHelper from "./func/learnerHelper.js";

@Discord()
@SlashGroup({ name: "learner", description: "Learner specific point commands" })
@SlashGroup("learner")
@Guard(IsAdmin)
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
