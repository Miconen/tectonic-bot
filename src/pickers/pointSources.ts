import { withAutocompleteLogging } from "@logging/guard";
import { safeRespond } from "@utils/pickers";
import { getSources } from "@utils/pointSources";
import type { AutocompleteInteraction } from "discord.js";

export const pointSourcePicker = withAutocompleteLogging(
  "pointSourcePicker",
  async (interaction: AutocompleteInteraction<"cached">): Promise<void> => {
    const sources = await getSources(interaction.guild.id);
    if (!sources) return;

    const options = Array.from(sources.values()).map((s) => ({
      name: `${s.name} | ${s.points} points`,
      value: s.source,
    }));

    await safeRespond(interaction, options);
  }
);
