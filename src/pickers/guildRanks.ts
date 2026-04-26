import { withAutocompleteLogging } from "@logging/guard";
import { Requests } from "@requests/main";
import { formatDisplayName } from "@utils/formatDisplayName";
import { safeRespond } from "@utils/pickers";
import type { AutocompleteInteraction } from "discord.js";

export const guildRankPicker = withAutocompleteLogging(
  "guildRankPicker",
  async (interaction: AutocompleteInteraction): Promise<void> => {
    if (!interaction.guild?.id) {
      await safeRespond(interaction, []);
      return;
    }

    const res = await Requests.getGuildRanks(interaction.guild.id);
    if (res.error || !res.data) {
      await safeRespond(interaction, []);
      return;
    }

    const query = interaction.options
      .getFocused(true)
      .value.toLowerCase()
      .trim();

    const filtered = res.data.filter(
      (r) => !query || r.name.toLowerCase().includes(query)
    );

    const options = filtered.map((r) => ({
      name: `${r.icon ?? ""} ${formatDisplayName(r.name)} — ${
        r.min_points
      } pts`.trim(),
      value: r.name,
    }));

    await safeRespond(interaction, options);
  }
);
