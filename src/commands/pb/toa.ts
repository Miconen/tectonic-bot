import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";


@Discord()
@SlashGroup("pb")
class toapb {
    @Slash({ name: "toa", description: "Request your new pb to be added" })
    async toa(
        @SlashOption({
            name: "time",
            description: "ToA pb time",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        time: string,
        @SlashOption({
            name: "raidlevel",
            description: "ToA raid level",
            required: true,
            type: ApplicationCommandOptionType.Number,
        })
        raidlevel: number,
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
