import IsAdmin from "@guards/IsAdmin.js";
import type { SplitCache, SplitData } from "@typings/splitTypes.js";
import type IPointService from "@utils/pointUtils/IPointService";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import { formatTimeAgo } from "@utils/timeFormatter.js";
import {
	ApplicationCommandOptionType,
	type AutocompleteInteraction,
	type CommandInteraction,
	type Snowflake,
	type TextChannel,
} from "discord.js";
import { Discord, Guard, Slash, SlashChoice, SlashOption } from "discordx";
import { container, injectable } from "tsyringe";
import acceptHelper from "./func/acceptHelper.js";
import denyHelper from "./func/denyHelper.js";
import splitHelper from "./func/splitHelper.js";

const state: SplitCache = new Map<Snowflake, SplitData>();

function autocompleter(interaction: AutocompleteInteraction) {
	// Convert Map entries to an array of autocomplete options
	const options = Array.from(state.entries()).map(([id, data]) => ({
		name: `${data.member.displayName} - ${data.points} points (${formatTimeAgo(data.timestamp)})`,
		value: id,
	}));

	// Respond with the options (limit to 25 as per Discord's requirements)
	interaction.respond(options.slice(0, 25));
}

@Discord()
@injectable()
class split {
	@Slash({ name: "split", description: "Receive points for splitting" })
	async split(
		@SlashChoice({
			name: "2-100m",
			value: "split_low",
		})
		@SlashChoice({
			name: "100-500m",
			value: "split_medium",
		})
		@SlashChoice({
			name: "500m+",
			value: "split_high",
		})
		@SlashOption({
			name: "value",
			description: "Value of the split drop?",
			required: true,
			type: ApplicationCommandOptionType.String,
		})
		value: string,
		interaction: CommandInteraction,
	) {
		const pointService = container.resolve<IPointService>("PointService");

		const rewardValue = pointService.pointRewards.get(value) ?? 0;
		await splitHelper(rewardValue, interaction, state);
	}

	@Slash({
		name: "accept",
		description: "Accept a split by id",
	})
	@Guard(IsAdmin)
	async accept(
		@SlashOption({
			name: "id",
			description: "Id of the split event",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: autocompleter,
		})
		id: string,
		interaction: CommandInteraction,
	) {
		const split = state.get(id);
		if (!split)
			return await replyHandler(
				getString("errors", "internalError"),
				interaction,
			);

		const response = await acceptHelper(interaction, split);

		// Free up memory
		state.delete(id);
		return await replyHandler(response, interaction);
	}

	@Slash({
		name: "deny",
		description: "Deny a split by id",
	})
	@Guard(IsAdmin)
	async deny(
		@SlashOption({
			name: "id",
			description: "Id of the split event",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: autocompleter,
		})
		id: string,
		interaction: CommandInteraction,
	) {
		const split = state.get(id);
		if (!split)
			return await replyHandler(
				getString("errors", "internalError"),
				interaction,
			);

		const response = await denyHelper(interaction, split);

		// Free up memory
		state.delete(id);
		return await replyHandler(response, interaction);
	}

	@Slash({
		name: "splitinfo",
		description: "Get information about a split only visible to you",
	})
	@Guard(IsAdmin)
	async splitinfo(
		@SlashOption({
			name: "id",
			description: "Id of the split event",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: autocompleter,
		})
		id: string,
		interaction: CommandInteraction,
	) {
		const split = state.get(id);
		if (!split)
			return await replyHandler(
				getString("errors", "internalError"),
				interaction,
			);

		const channel = (await interaction.client.channels.fetch(
			split.channel,
		)) as TextChannel;
		if (!channel) return "Channel not found";
		const message = await channel.messages.fetch(split.message);

		const response = `# Split: ${split.member.displayName}\nPoints: ${split.points} points\nCreated: ${formatTimeAgo(split.timestamp)}\nMessage: ${message.url}`;

		return await replyHandler(response, interaction);
	}
}
