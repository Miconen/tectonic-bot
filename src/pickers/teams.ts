import { withAutocompleteLogging } from "@logging/guard";
import { safeRespond, fetchTeams } from "@utils/pickers";
import type { AutocompleteInteraction } from "discord.js";

export const teamPicker = withAutocompleteLogging(
  "teamPicker",
  async (interaction: AutocompleteInteraction): Promise<void> => {
    if (!interaction.guild?.id) {
      await safeRespond(interaction, []);
      return;
    }

    const competitionId = interaction.options.get("competition")?.value;
    if (!competitionId || typeof competitionId !== "number") {
      await safeRespond(interaction, []);
      return;
    }

    const teams = await fetchTeams(competitionId);
    if (!teams || teams.length === 0) {
      await safeRespond(interaction, []);
      return;
    }

    const options = teams
      .filter((team) => team && typeof team === "string" && team.trim() !== "")
      .map((team) => ({
        name: team,
        value: team,
      }));

    await safeRespond(interaction, options);
  }
);
