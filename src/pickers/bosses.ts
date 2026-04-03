import TimeConverter from "@commands/pb/func/TimeConverter";
import { withAutocompleteLogging } from "@logging/guard";
import { getGuild } from "@utils/guildTimes";
import { safeRespond } from "@utils/pickers";
import type { AutocompleteInteraction } from "discord.js";

export const bossTimePicker = withAutocompleteLogging(
  "bossTimePicker",
  async (interaction: AutocompleteInteraction): Promise<void> => {
    if (!interaction.guild?.id) {
      await safeRespond(interaction, []);
      return;
    }

    const search = interaction.options.get("boss")?.value;
    if (search === undefined || typeof search !== "string") {
      await safeRespond(interaction, []);
      return;
    }

    const guild = await getGuild(interaction.guild.id);
    if (!guild) {
      await safeRespond(interaction, []);
      return;
    }

    if (!guild.pbs) {
      await safeRespond(interaction, []);
      return;
    }

    // Get all boss options first
    const allOptions = guild.pbs.flatMap((t) => {
      const boss = guild.bosses.find((b) => b.name === t.boss_name);
      return boss
        ? [
            {
              name: `${boss.category} | ${
                boss.display_name
              } - ${TimeConverter.ticksToTime(t.time)} (${t.time} ticks)`,
              value: t.boss_name,
            },
          ]
        : [];
    });

    // Filter options based on search input
    const searchLower = search.toLowerCase();
    const filteredOptions = allOptions.filter((option) =>
      option.name.toLowerCase().includes(searchLower)
    );

    await safeRespond(interaction, filteredOptions);
  }
);
