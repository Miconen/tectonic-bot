import { CommandInteraction } from "discord.js";
import addTime from "./addTime.js";
import TimeConverter from "./TimeConverter.js";
import timeToTicks from "./timeToTicks.js";
import updateEmbed from "./updateEmbed.js";
import updatePb from "./updatePb.js";

async function submitHandler(boss: string, time: string, team: (string | undefined)[], interaction: CommandInteraction) {
    const guildId = interaction.guildId!;
    const ticks = TimeConverter.timeToTicks(time);
    if (!ticks) return;
    const addedTime = await addTime(ticks, boss, team, guildId);
    if (!addedTime) return;
    const updated = await updatePb(addedTime.time, addedTime.run_id, boss, guildId);
    if (!updated) return;
    await updateEmbed(boss, guildId, interaction);
}

export default submitHandler;
