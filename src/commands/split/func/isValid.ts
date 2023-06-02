import { ButtonInteraction, GuildMember } from "discord.js";
import { GuardFunction } from "discordx";
import getInteractionId from "./getInteractionId.js";
import { InteractionCache } from "./InteractionCache.js";

export function IsValid(state: InteractionCache) {
    const guard: GuardFunction<ButtonInteraction> = async (interaction, _, next) => {
        const member = interaction.member as GuildMember;

        console.log(`Checking state for: ${member.displayName} (${member.user.username}#${member.user.discriminator})`);
        let interactionId = getInteractionId(interaction);

        // If command has not been stored in memory, don't run.
        // Idea is not to handle commands that haven't been stored since restart.
        if (!state.interactionState.has(interactionId)) {
            await interaction.reply("❌ Point request expired...");
            console.log("↳ Denied")
            return;
        }
        // If command has been run once, don't run again. Returns true if ran once.
        if (state.interactionState.get(interactionId)) {
            await interaction.reply("❌ Points already handled");
            console.log("↳ Denied")
            return;
        }
        console.log("↳ Passed")
        await next();
    }

    return guard;
}

export default IsValid;
