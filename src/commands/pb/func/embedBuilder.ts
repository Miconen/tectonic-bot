import { BaseInteraction, EmbedBuilder } from "discord.js";

const embedBuilder = (interaction: BaseInteraction): EmbedBuilder => {
	return new EmbedBuilder()
		.setAuthor({
			name: "Tectonic Bot",
			url: "https://github.com/Miconen/tectonic-bot",
			iconURL: interaction.client.user?.avatarURL() ?? "",
		})
		.setColor("#0099ff")
		.setTimestamp();
};

export default embedBuilder;
