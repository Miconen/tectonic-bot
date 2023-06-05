import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";

@Discord()
@SlashGroup("pb")
class tobpb {
    @Slash({ name: "tob", description: "Request your new pb to be added" })
    async hmt(
        @SlashOption({
            name: "time",
            description: "Tob pb time",
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
