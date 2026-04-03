import { withAutocompleteLogging } from "@logging/guard";
import { getEvents } from "@utils/events";
import { safeRespond } from "@utils/pickers";
import type { AutocompleteInteraction } from "discord.js";

export const eventPicker = withAutocompleteLogging(
  "eventPicker",
  async (interaction: AutocompleteInteraction): Promise<void> => {
    if (!interaction.guild?.id) {
      await safeRespond(interaction, []);
      return;
    }

    const events = await getEvents(interaction.guild.id);
    if (!events) {
      await safeRespond(interaction, []);
      return;
    }

    const query =
      interaction.options.getFocused(true).value.toLowerCase().trim() ?? "";

    const options = events
      .filter((e) => e.name.toLowerCase().includes(query))
      .map((e) => ({
        name: e.name,
        value: e.wom_id,
      }));

    await safeRespond(interaction, options);
  }
);
