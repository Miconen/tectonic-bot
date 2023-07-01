import { CommandInteraction } from "discord.js";
import addTime from "./addTime.js";
import TimeConverter from "./TimeConverter.js";
import updateEmbed from "./updateEmbed.js";
import updatePb from "./updatePb.js";

async function submitHandler(boss: string, time: string, team: (string | undefined)[], interaction: CommandInteraction) {
    console.log(`Submitting pb: ${boss} ${time}`);
    const guildId = interaction?.guildId;
    if (!guildId) {
        return console.log("↳ Failed getting guildId")
    };
    const ticks = TimeConverter.timeToTicks(time);
    if (!ticks) {
        return console.log("↳ Failed parsing ticks from time")
    };
    const addedTime = await addTime(ticks, boss, team, guildId);
    if (!addedTime) {
        return console.log("↳ Failed adding time")
    } else {
        console.log("↳ Time added")
    };
    const updated = await updatePb(addedTime.time, addedTime.run_id, boss, guildId);
    if (!updated) {
        return console.log("↳ Not a new pb")
    } else {
        console.log("↳ New pb")
    };
    await updateEmbed(boss, guildId, interaction);
}

export default submitHandler;
