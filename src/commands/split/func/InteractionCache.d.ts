import {CommandInteraction} from "discord.js";

type InteractionCache = {
    interactionMap: Map<string, CommandInteraction>,
    interactionState: Map<string, boolean>,
    pointsMap: Map<string, number>,
}
