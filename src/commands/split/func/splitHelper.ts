import {
    ActionRowBuilder,
    ButtonBuilder, ButtonStyle,
    CommandInteraction,
    GuildMember,
    MessageActionRowComponentBuilder
} from "discord.js";
import * as pointUtils from "../../../utility/pointUtils/index.js";
import { SplitCache, SplitData } from "./splitTypes.js";

const splitHelper = async (value: number, interaction: CommandInteraction, state: SplitCache) => {
    value = await pointUtils.pointsHandler(value, interaction.guild!.id);

    // Create the button, giving it the id: "approve-btn"
    const approveButton = new ButtonBuilder()
        .setLabel("Approve")
        .setStyle(ButtonStyle.Success)
        .setCustomId("approve-btn");

    // Create a button, giving it the id: "deny-btn"
    const denyButton = new ButtonBuilder()
        .setLabel("Deny")
        .setStyle(ButtonStyle.Danger)
        .setCustomId("deny-btn");

    // Create a MessageActionRow and add the button to that row.
    const row =
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
            approveButton,
            denyButton,
        );

    const msg = `**${(interaction.member as GuildMember).displayName
    }** has submitted a request for ${value} points. Please wait for admin approval and make sure you have posted a screenshot of your drop as proof.`;
    await interaction.reply({
        content: msg,
        components: [row],
    });

    const split: SplitData = {
        member: interaction.member as GuildMember,
        points: value
    }

    state.set(interaction.id, split)
}

export default splitHelper;
