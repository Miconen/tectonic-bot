import {
    ButtonInteraction,
    CommandInteraction,
    ApplicationCommandOptionType,
    Snowflake,
} from "discord.js"
import type { SplitCache, SplitData } from "../../typings/splitTypes.js"
import type IPointService from "../../utils/pointUtils/IPointService"

import {
    Discord,
    Slash,
    ButtonComponent,
    SlashChoice,
    SlashOption,
    Guard,
} from "discordx"
import splitHelper from "./func/splitHelper.js"
import acceptHelper from "./func/acceptHelper.js"
import denyHelper from "./func/denyHelper.js"
import IsAdmin from "../../guards/IsAdmin.js"
import IsValid from "../../guards/IsValidInteraction.js"
import { container, injectable } from "tsyringe"

let state: SplitCache = new Map<Snowflake, SplitData>()

@Discord()
@injectable()
class split {
    @Slash({ name: "split", description: "Receive points for splitting" })
    async split(
        @SlashChoice({
            name: "2-100m",
            value: "split_low",
        })
        @SlashChoice({
            name: "100-500m",
            value: "split_medium",
        })
        @SlashChoice({
            name: "500m+",
            value: "split_high",
        })
        @SlashOption({
            name: "value",
            description: "Value of the split drop?",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        value: string,
        interaction: CommandInteraction
    ) {
        const pointService = container.resolve<IPointService>("PointService")

        let rewardValue = pointService.pointRewards.get(value) ?? 0
        await splitHelper(rewardValue, interaction, state)
    }

    // register a handler for the button with id: "approve-btn"
    @ButtonComponent({ id: "approve-btn" })
    @Guard(IsAdmin, IsValid(state))
    approveButton(interaction: ButtonInteraction) {
        return acceptHelper(interaction, state)
    }

    // register a handler for the button with id: "deny-btn"
    @ButtonComponent({ id: "deny-btn" })
    @Guard(IsAdmin, IsValid(state))
    denyButton(interaction: ButtonInteraction) {
        return denyHelper(interaction, state)
    }
}
