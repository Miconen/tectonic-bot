import { withAutocompleteLogging } from "@logging/guard";
import type { Achievement } from "@typings/api/achievement";
import { Achievements } from "@utils/achievements";
import { safeRespond, fetchUser } from "@utils/pickers";
import type { AutocompleteInteraction } from "discord.js";

export const achievementAddPicker = withAutocompleteLogging(
  "achievementAddPicker",
  async (interaction: AutocompleteInteraction<"cached">): Promise<void> => {
    const picker = (u: Achievement[], a: Achievement) =>
      !u.some((ua) => ua.name === a.name);
    achievementPicker(interaction, picker);
  }
);

export const achievementRemovePicker = withAutocompleteLogging(
  "achievementRemovePicker",
  async (interaction: AutocompleteInteraction<"cached">): Promise<void> => {
    const picker = (u: Achievement[], a: Achievement) =>
      u.some((ua) => ua.name === a.name);
    achievementPicker(interaction, picker);
  }
);

export async function achievementPicker(
  interaction: AutocompleteInteraction<"cached">,
  picker: (u: Achievement[], a: Achievement) => boolean
): Promise<void> {
  const id = interaction.options.get("username")?.value ?? interaction.user.id;
  if (!id || typeof id !== "string") {
    await safeRespond(interaction, []);
    return;
  }

  const user = await fetchUser(interaction.guild.id, id);
  if (!user || !user.achievements || !Array.isArray(user.achievements)) {
    await safeRespond(interaction, []);
    return;
  }

  const achievements = Achievements.toArray().filter((a) =>
    picker(user.achievements, a)
  );

  const options = achievements.map((achievement) => ({
    name: achievement.name,
    value: achievement.name,
  }));

  await safeRespond(interaction, options);
}
