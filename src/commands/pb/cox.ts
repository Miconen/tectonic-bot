import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";


@Discord()
@SlashGroup("pb")
class coxpb {
    @Slash({ name: "cox", description: "Request your new pb to be added" })
    async cox(
        @SlashOption({
            name: "time",
            description: "CoX pb time",
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
        @SlashOption({
            name: "player6",
            description: "Teammate discord @name",
            required: false,
            type: ApplicationCommandOptionType.String,
        })
        player6: string | null,
        @SlashOption({
            name: "player7",
            description: "Teammate discord @name",
            required: false,
            type: ApplicationCommandOptionType.String,
        })
        player7: string | null,
        @SlashOption({
            name: "player8",
            description: "Teammate discord @name",
            required: false,
            type: ApplicationCommandOptionType.String,
        })
        player8: string | null,
        interaction: CommandInteraction,
    ) {
        await interaction.reply(time);
    }
}
