import { Requests } from "@requests/main";
import type { CommandInteraction } from "discord.js";

const startHelper = async (interaction: CommandInteraction) => {
    if (!interaction.guild) return await interaction.reply("Error initializing guild")

    // Handle giving of points, returns a string to be sent as a message.
    let res = await Requests.createGuild(interaction.guild.id);
    if (res.error) return await interaction.reply("Error initializing guild")
    await interaction.reply("Guild initialized");
}

export default startHelper;
