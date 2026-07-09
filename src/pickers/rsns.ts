import { getLogger } from "@logging/context";
import { withAutocompleteLogging } from "@logging/guard";
import { safeRespond, fetchUser } from "@utils/pickers";
import type { AutocompleteInteraction } from "discord.js";

export const rsnPicker = withAutocompleteLogging(
  "rsnPicker",
  async (interaction: AutocompleteInteraction<"cached">): Promise<void> => {
    const logger = getLogger();

    const id =
      interaction.options.get("username")?.value ?? interaction.user.id;
    if (!id || typeof id !== "string") {
      await safeRespond(interaction, []);
      return;
    }

    const user = await fetchUser(interaction.guild.id, id);
    if (!user || !user.rsns || !Array.isArray(user.rsns)) {
      await safeRespond(interaction, []);
      return;
    }

    const query = interaction.options
      .getFocused(true)
      .value.toLowerCase()
      .trim();

    let filteredRsns = user.rsns;
    if (query) {
      filteredRsns = user.rsns.filter((rsn) => {
        // More defensive check for rsn object structure
        return (
          rsn &&
          typeof rsn === "object" &&
          "rsn" in rsn &&
          typeof rsn.rsn === "string" &&
          rsn.rsn.toLowerCase().includes(query)
        );
      });
    }

    if (!filteredRsns || filteredRsns.length === 0) {
      logger.debug(`No RSNs found for user ${id} after filtering`);
      await safeRespond(interaction, []);
      return;
    }

    const options = filteredRsns
      .map((rsn) => ({
        name: rsn.rsn,
        value: rsn.rsn,
      }))
      .filter(
        (option) =>
          option.name &&
          option.value &&
          option.name.trim() !== "" &&
          option.value.trim() !== ""
      );

    await safeRespond(interaction, options);
  }
);
