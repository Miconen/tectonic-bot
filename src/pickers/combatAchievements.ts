import { withAutocompleteLogging } from "@logging/guard";
import type { CombatAchievementEntry } from "@typings/api/achievement";
import { getGuildCAs } from "@utils/combatAchievement";
import { fetchUser, safeRespond } from "@utils/pickers";
import type { AutocompleteInteraction } from "discord.js";

export const combatAchievementPicker = withAutocompleteLogging(
  "combatAchievementPicker",
  async (interaction: AutocompleteInteraction): Promise<void> => {
    if (!interaction.guild?.id) {
      await safeRespond(interaction, []);
      return;
    }

    const cas = await getGuildCAs(interaction.guild.id);
    if (!cas) {
      await safeRespond(interaction, []);
      return;
    }

    const user = await fetchUser(interaction.guild.id, interaction.user.id);
    const completedNames = new Set(
      user?.combat_achievements?.map((ca) => ca.name) ?? []
    );

    const query = interaction.options
      .getFocused(true)
      .value.toLowerCase()
      .trim();

    const filtered = cas
      .filter((ca) => !completedNames.has(ca.name))
      .filter((ca) => !query || ca.name.toLowerCase().includes(query));

    const options = filtered.map((ca) => ({
      name: `${ca.name} | ${ca.points} points`,
      value: ca.name,
    }));

    await safeRespond(interaction, options);
  }
);
export const caGrantPicker = withAutocompleteLogging(
  "caGrantPicker",
  async (interaction: AutocompleteInteraction): Promise<void> => {
    const picker = (completed: string[], ca: CombatAchievementEntry) =>
      !completed.includes(ca.name);
    caPicker(interaction, picker);
  }
);

export const caRemovePicker = withAutocompleteLogging(
  "caRemovePicker",
  async (interaction: AutocompleteInteraction): Promise<void> => {
    const picker = (completed: string[], ca: CombatAchievementEntry) =>
      completed.includes(ca.name);
    caPicker(interaction, picker);
  }
);

async function caPicker(
  interaction: AutocompleteInteraction,
  picker: (completed: string[], ca: CombatAchievementEntry) => boolean
): Promise<void> {
  if (!interaction.guild?.id) {
    await safeRespond(interaction, []);
    return;
  }

  const id = interaction.options.get("username")?.value ?? interaction.user.id;
  if (!id || typeof id !== "string") {
    await safeRespond(interaction, []);
    return;
  }

  const [user, cas] = await Promise.all([
    fetchUser(interaction.guild.id, id),
    getGuildCAs(interaction.guild.id),
  ]);

  if (!cas) {
    await safeRespond(interaction, []);
    return;
  }

  const completedNames = user?.combat_achievements?.map((ca) => ca.name) ?? [];

  const query = interaction.options.getFocused(true).value.toLowerCase().trim();

  const filtered = cas
    .filter((ca) => picker(completedNames, ca))
    .filter((ca) => !query || ca.name.toLowerCase().includes(query));

  const options = filtered.map((ca) => ({
    name: `${ca.name} | ${ca.points} points`,
    value: ca.name,
  }));

  await safeRespond(interaction, options);
}
