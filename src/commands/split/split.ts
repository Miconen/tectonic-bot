import {
    ButtonInteraction,
    CommandInteraction,
    ButtonStyle,
    ApplicationCommandOptionType,
} from "discord.js";
import {
    Discord,
    Slash,
    ButtonComponent,
    SlashChoice,
    SlashOption,
} from "discordx";
import * as pointUtils from "../../utility/pointUtils/index.js";
import splitHelper from "./func/splitHelper.js";
import acceptHelper from "./func/acceptHelper.js";
import {InteractionCache} from "./func/InteractionCache.js";
import denyHelper from "./func/denyHelper.js";

let state: InteractionCache = {
    interactionMap: new Map<string, CommandInteraction>(),
    interactionState: new Map<string, boolean>(),
    pointsMap: new Map<string, number>(),
}

@Discord()
class split {
    @Slash({ name: "split", description: "Receive points for splitting" })
    async split(
        @SlashChoice({
            name: "2-100m",
            value: pointUtils.pointRewards.get("split_low"),
        })
        @SlashChoice({
            name: "100-500m",
            value: pointUtils.pointRewards.get("split_medium"),
        })
        @SlashChoice({
            name: "500m+",
            value: pointUtils.pointRewards.get("split_high"),
        })
        @SlashOption({
            name: "value",
            description: "Value of the split drop?",
            required: true,
            type: ApplicationCommandOptionType.Number,
        })
        value: number,
        interaction: CommandInteraction,
    ) {
        await splitHelper(value, interaction, state);
    }

    // register a handler for the button with id: "approve-btn"
    @ButtonComponent({ id: "approve-btn" })
    async approveButton(interaction: ButtonInteraction) {
        return acceptHelper(interaction, state);
    }

    // register a handler for the button with id: "deny-btn"
    @ButtonComponent({ id: "deny-btn" })
    async denyButton(interaction: ButtonInteraction) {
        return denyHelper(interaction, state);
    }
}
