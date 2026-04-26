import TimeConverter from "@commands/pb/func/TimeConverter";
import { withAutocompleteLogging } from "@logging/guard";
import { getGuild } from "@utils/guildTimes";
import { safeRespond } from "@utils/pickers";
import type { AutocompleteInteraction } from "discord.js";

/**
 * Picker that shows ALL guild records across all positions.
 * Each option shows: "Category | Boss | #Position - Value | Players"
 */
export const recordPicker = withAutocompleteLogging(
  "recordPicker",
  async (interaction: AutocompleteInteraction): Promise<void> => {
    if (!interaction.guild?.id) {
      await safeRespond(interaction, []);
      return;
    }

    const guild = await getGuild(interaction.guild.id);
    if (!guild || !guild.records) {
      await safeRespond(interaction, []);
      return;
    }

    const search = interaction.options.get("record")?.value;
    const query = typeof search === "string" ? search.toLowerCase().trim() : "";

    // Build a map of user_id -> display name from teammates
    const userNames = new Map<string, string>();
    if (guild.teammates) {
      for (const tm of guild.teammates) {
        // We don't have RSNs here, just user IDs — but we can show the ID
        userNames.set(tm.user_id, tm.user_id);
      }
    }

    const allOptions = guild.records
      .sort((a, b) => {
        // Sort by boss name, then position
        const bossCmp = a.boss_name.localeCompare(b.boss_name);
        if (bossCmp !== 0) return bossCmp;
        return a.position - b.position;
      })
      .map((r) => {
        const boss = guild.bosses.find((b) => b.name === r.boss_name);
        if (!boss) return null;

        const valueType = boss.value_type ?? "time";
        const displayValue =
          valueType === "time"
            ? TimeConverter.ticksToTime(r.value)
            : `${r.value}`;

        const teammates = (guild.teammates ?? [])
          .filter((tm) => tm.record_id === r.record_id)
          .map((tm) => tm.user_id.slice(-4)) // last 4 digits as short ID
          .join(", ");

        const teamPart = teammates ? ` | ${teammates}` : "";

        const label = `${boss.category} | ${boss.display_name} #${r.position} - ${displayValue}${teamPart}`;

        return {
          // Discord autocomplete name max is 100 chars
          name: label.length > 100 ? `${label.slice(0, 97)}...` : label,
          value: r.record_id.toString(),
        };
      })
      .filter((o): o is { name: string; value: string } => o !== null);

    const filtered = query
      ? allOptions.filter((o) => o.name.toLowerCase().includes(query))
      : allOptions;

    await safeRespond(interaction, filtered);
  }
);
