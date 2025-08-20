import type { ButtonInteraction } from "discord.js";

const getInteractionId = (interaction: ButtonInteraction) => {
	if (!interaction.message.interaction?.id)
		console.log("ERROR: Interaction ID defaulted to 0");
	return interaction.message.interaction?.id ?? "0";
};

export default getInteractionId;
