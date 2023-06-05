import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import bossCategories from "./func/getBosses.js";

@Discord()
@SlashGroup("pb")
class nightmarepb {
    @Slash({ name: "nightmare", description: "Request your new pb to be added" })
    async nightmare(
        @SlashChoice(...bossCategories["Nightmare"])
        @SlashOption({
            name: "boss",
            description: "Boss to submit time for",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        @SlashOption({
            name: "time",
            description: "Nightmare pb time",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        time: string,
        @SlashOption({
            name: "player2",
            description: "Teammate discord @name",
            required: false,
            type: ApplicationCommandOptionType.String,
        })
        player2: string | null,
        @SlashOption({
            name: "player3",
            description: "Teammate discord @name",
            required: false,
            type: ApplicationCommandOptionType.String,
        })
        player3: string | null,
        @SlashOption({
            name: "player4",
            description: "Teammate discord @name",
            required: false,
            type: ApplicationCommandOptionType.String,
        })
        player4: string | null,
        @SlashOption({
            name: "player5",
            description: "Teammate discord @name",
            required: false,
            type: ApplicationCommandOptionType.String,
        })
        player5: string | null,
        interaction: CommandInteraction,
    ) {
        await interaction.reply(time);
    }
}
