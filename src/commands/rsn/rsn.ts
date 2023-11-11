import {
    ApplicationCommandOptionType,
    CommandInteraction,
    GuildMember,
} from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import IsAdmin from "../../guards/IsAdmin.js";
import { addRsnHelper, removeAllRsnHelper, removeRsnHelper } from "./func/rsnHelpers.js";

@Discord()
@SlashGroup({ name: "rsn", description: "RSN specific commands" })
@SlashGroup("rsn")
@Guard(IsAdmin)
class RSN {
    @Slash({
        name: "add",
        description: "Add RSN for a discord user",
    })
    async addRsn(
        @SlashOption({
            name: "username",
            description: "User to link an account to",
            required: true,
            type: ApplicationCommandOptionType.User,
        })
        user: GuildMember,
        @SlashOption({
            name: "rsn",
            description: "RSN to add",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        rsn: string,
        interaction: CommandInteraction,
    ) {
        return addRsnHelper(user, rsn, interaction);
    }

    @Slash({
        name: "remove",
        description: "Remove RSN for a discord user",
    })
    async removeRsn(
        @SlashOption({
            name: "username",
            description: "User to unlink account from",
            required: true,
            type: ApplicationCommandOptionType.User,
        })
        user: GuildMember,
        @SlashOption({
            name: "rsn",
            description: "RSN to remove",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        rsn: string,
        interaction: CommandInteraction,
    ) {
        return removeRsnHelper(user, rsn, interaction);
    }

    @Slash({
        name: "removeall",
        description: "Remove all RSNs for a discord user",
    })
    async removeAllRsn(
        @SlashOption({
            name: "username",
            description: "User to unlink account from",
            required: true,
            type: ApplicationCommandOptionType.User,
        })
        user: GuildMember,
        interaction: CommandInteraction,
    ) {
        return removeAllRsnHelper(user, interaction);
    }
}

