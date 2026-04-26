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

    if (!guild.records) {
      await safeRespond(interaction, []);
      return;
    }

    // Get all boss options from #1 position records
    const allOptions = guild.records
      .filter((r) => r.position === 1)
      .flatMap((r) => {
        const boss = guild.bosses.find((b) => b.name === r.boss_name);
        if (!boss) return [];
        const displayValue =
          boss.value_type === "time"
            ? `${TimeConverter.ticksToTime(r.value)} (${r.value} ticks)`
            : `${r.value}`;
        return [
          {
            name: `${boss.category} | ${boss.display_name} - ${displayValue}`,
            value: r.boss_name,
          },
        ];
      });

    // Filter options based on search input
    const searchLower = search.toLowerCase();
    const filteredOptions = allOptions.filter((option) =>
      option.name.toLowerCase().includes(searchLower)
    );

    await safeRespond(interaction, filteredOptions);
  }
);
