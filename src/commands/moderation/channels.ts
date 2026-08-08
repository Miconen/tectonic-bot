import IsAdmin from "@guards/IsAdmin.js";
import RequiresGuild from "@guards/RequiresGuild";
import { Requests } from "@requests/main.js";
import { replyApiError } from "@utils/replyApiError";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import {
	ApplicationCommandOptionType,
	ChannelType,
	MessageFlags,
	type CommandInteraction,
	type TextChannel,
} from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";

@Discord()
@SlashGroup("moderation")
@Guard(IsAdmin, RequiresGuild)
class ModChannel {
	@Slash({
		name: "modchannel",
		description: "Set the moderation channel for approval requests",
	})
	async modchannel(
		@SlashOption({
			name: "channel",
			description: "Channel for approval requests",
			required: true,
			type: ApplicationCommandOptionType.Channel,
			channelTypes: [ChannelType.GuildText],
		})
		channel: TextChannel,
		interaction: CommandInteraction<"cached">,
	) {
		const res = await Requests.updateGuild(interaction.guild.id, {
			mod_channel_id: channel.id,
		});

		if (res.error) {
			return await replyApiError(res, interaction, { category: "guildErrors" });
		}

		return await replyHandler(
			getString("moderation", "modChannelSet", { channel: `<#${channel.id}>` }),
			interaction,
			{ flags: MessageFlags.Ephemeral },
		);
	}

	@Slash({
		name: "logchannel",
		description: "Set the logging channel",
	})
	async logchannel(
		@SlashOption({
			name: "channel",
			description: "Channel for logging",
			required: true,
			type: ApplicationCommandOptionType.Channel,
			channelTypes: [ChannelType.GuildText],
		})
		channel: TextChannel,
		interaction: CommandInteraction<"cached">,
	) {
		const res = await Requests.updateGuild(interaction.guild.id, {
			log_channel_id: channel.id,
		});

		if (res.error) {
			return await replyApiError(res, interaction, { category: "guildErrors" });
		}

		return await replyHandler(
			getString("moderation", "logChannelSet", { channel: `<#${channel.id}>` }),
			interaction,
			{ flags: MessageFlags.Ephemeral },
		);
	}
}
