import { type BaseInteraction, EmbedBuilder } from "discord.js";

const embedBuilder = (interaction: BaseInteraction): EmbedBuilder => {
	return new EmbedBuilder()
		.setColor("#0099ff")
		.setTimestamp();
};

export default embedBuilder;
