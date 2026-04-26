import {
  ApplicationCommandOptionType,
  type CommandInteraction,
} from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import IsAdmin from "@guards/IsAdmin.js";
import { Requests } from "@requests/main.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import { formatDisplayName } from "@utils/formatDisplayName.js";
import { guildRankPicker } from "pickers/guildRanks";

@Discord()
@Guard(IsAdmin)
@SlashGroup({
  description: "Manage guild rank tiers",
  name: "ranks",
  root: "moderation",
})
@SlashGroup("ranks", "moderation")
class ModerationRanks {
  @Slash({
    name: "list",
    description: "List all rank tiers for this guild",
  })
  async list(interaction: CommandInteraction) {
    if (!interaction.guild)
      return await replyHandler(getString("errors", "noGuild"), interaction);

    await interaction.deferReply({ ephemeral: true });

    const res = await Requests.getGuildRanks(interaction.guild.id);
    if (res.error) {
      return await replyHandler(
        getString("errors", "apiError", {
          activity: "fetching guild ranks",
          error: res.message,
        }),
        interaction,
        { ephemeral: true }
      );
    }

    const ranks = res.data;
    if (!ranks || ranks.length === 0) {
      return await replyHandler("No rank tiers configured.", interaction, {
        ephemeral: true,
      });
    }

    const lines = ["## Guild Rank Tiers\n"];
    for (const rank of ranks) {
      const icon = rank.icon ?? "";
      const rolePart = rank.role_id ? ` | <@&${rank.role_id}>` : "";
      lines.push(
        `${icon} **${formatDisplayName(rank.name)}** — ${
          rank.min_points
        } points${rolePart}`
      );
    }

    return await replyHandler(lines.join("\n"), interaction, {
      ephemeral: true,
    });
  }

  @Slash({
    name: "create",
    description: "Create a new rank tier",
  })
  async create(
    @SlashOption({
      name: "name",
      description: "Rank name (e.g. 'diamond')",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    name: string,
    @SlashOption({
      name: "min_points",
      description: "Minimum points threshold",
      required: true,
      type: ApplicationCommandOptionType.Integer,
    })
    minPoints: number,
    @SlashOption({
      name: "display_order",
      description: "Display order (lower = first)",
      required: true,
      type: ApplicationCommandOptionType.Integer,
    })
    displayOrder: number,
    @SlashOption({
      name: "icon",
      description: "Discord emoji string for the rank",
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    icon: string | undefined,
    @SlashOption({
      name: "role",
      description: "Discord role to assign at this rank",
      required: false,
      type: ApplicationCommandOptionType.Role,
    })
    role: { id: string } | undefined,
    interaction: CommandInteraction
  ) {
    if (!interaction.guild)
      return await replyHandler(getString("errors", "noGuild"), interaction);

    const res = await Requests.createGuildRank(interaction.guild.id, {
      name,
      min_points: minPoints,
      display_order: displayOrder,
      icon: icon ?? undefined,
      role_id: role?.id ?? undefined,
    });

    if (res.error) {
      return await replyHandler(
        getString("errors", "apiError", {
          activity: "creating rank",
          error: res.message,
        }),
        interaction
      );
    }

    return await replyHandler(
      `Rank **${name}** created (${minPoints} points).`,
      interaction
    );
  }

  @Slash({
    name: "update",
    description: "Update an existing rank tier",
  })
  async update(
    @SlashOption({
      name: "name",
      description: "Rank to update",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: guildRankPicker,
    })
    name: string,
    @SlashOption({
      name: "min_points",
      description: "New minimum points threshold",
      required: false,
      type: ApplicationCommandOptionType.Integer,
    })
    minPoints: number | undefined,
    @SlashOption({
      name: "display_order",
      description: "New display order",
      required: false,
      type: ApplicationCommandOptionType.Integer,
    })
    displayOrder: number | undefined,
    @SlashOption({
      name: "icon",
      description: "New Discord emoji string",
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    icon: string | undefined,
    @SlashOption({
      name: "role",
      description: "New Discord role",
      required: false,
      type: ApplicationCommandOptionType.Role,
    })
    role: { id: string } | undefined,
    interaction: CommandInteraction
  ) {
    if (!interaction.guild)
      return await replyHandler(getString("errors", "noGuild"), interaction);

    const body: Record<string, unknown> = {};
    if (minPoints !== undefined) body.min_points = minPoints;
    if (displayOrder !== undefined) body.display_order = displayOrder;
    if (icon !== undefined) body.icon = icon;
    if (role !== undefined) body.role_id = role.id;

    const res = await Requests.updateGuildRank(
      interaction.guild.id,
      name,
      body
    );

    if (res.error) {
      return await replyHandler(
        getString("errors", "apiError", {
          activity: "updating rank",
          error: res.message,
        }),
        interaction
      );
    }

    return await replyHandler(`Rank **${name}** updated.`, interaction);
  }

  @Slash({
    name: "delete",
    description: "Delete a rank tier",
  })
  async delete(
    @SlashOption({
      name: "name",
      description: "Rank to delete",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: guildRankPicker,
    })
    name: string,
    interaction: CommandInteraction
  ) {
    if (!interaction.guild)
      return await replyHandler(getString("errors", "noGuild"), interaction);

    const res = await Requests.deleteGuildRank(interaction.guild.id, name);

    if (res.error) {
      return await replyHandler(
        getString("errors", "apiError", {
          activity: "deleting rank",
          error: res.message,
        }),
        interaction
      );
    }

    return await replyHandler(`Rank **${name}** deleted.`, interaction);
  }
}
