import { Discord, Slash, SlashOption, SlashGroup } from "discordx";
import {
    CommandInteraction,
    EmbedBuilder,
    GuildMember,
    ApplicationCommandOptionType,
} from "discord.js";
import { Pagination } from "@discordx/pagination";
import IsAdmin from "../utility/isAdmin.js";
import getLeaderboard from "../database/getLeaderboard.js";
import setPointMultiplier from "../database/setPointMultiplier.js";
import * as pointUtils from "../utility/pointUtils/index.js";

@Discord()
@SlashGroup({ name: "moderation", description: "Moderation related commands" })
@SlashGroup("moderation")
class Moderation {
    @Slash({ name: "give", description: "Give points to a user" })
    async give(
        @SlashOption({
            name: "username",
            description: "@User tag to give points to",
            required: true,
            type: ApplicationCommandOptionType.User,
        })
        @SlashOption({
            name: "amount",
            description: "Amount of points to give",
            required: true,
            type: ApplicationCommandOptionType.Number,
        })
        channel: GuildMember,
        addedPoints: number,
        interaction: CommandInteraction,
    ) {
        if (!IsAdmin(Number(interaction.member?.permissions))) return;

        // Handle giving of points, returns a string to be sent as a message.
        await pointUtils.givePoints(addedPoints, channel, interaction);
    }

    @Slash({
        name: "setmultiplier",
        description: "Set a server vide point multiplier",
    })
    async setmultiplier(
        @SlashOption({
            name: "multiplier",
            description: "Number that all points given will get multiplied by",
            required: true,
            type: ApplicationCommandOptionType.Number,
        })
        multiplier: number,
        interaction: CommandInteraction,
    ) {
        if (!IsAdmin(Number(interaction.member?.permissions))) return;

        let newMultiplier = await setPointMultiplier(
            interaction.guild!.id,
            multiplier,
        );

        let response: string;
        if (newMultiplier) {
            response = `Updated server point multiplier to ${newMultiplier}`;
        } else {
            response = "Something went wrong...";
        }

        await interaction.reply(response);
    }
}
