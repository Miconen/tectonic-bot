import { ApplicationCommandOptionType, CommandInteraction } from "discord.js"
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx"
import IsValidTime from "../../guards/IsValidTime.js";

@Discord()
@SlashGroup("pb")
@Guard(IsValidTime("time"))
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
            type: ApplicationCommandOptionType.User,
        })
        player2: string | null,
        @SlashOption({
            name: "player3",
            description: "Teammate discord @name",
            required: false,
            type: ApplicationCommandOptionType.User,
        })
        player3: string | null,
        @SlashOption({
            name: "player4",
            description: "Teammate discord @name",
            required: false,
            type: ApplicationCommandOptionType.User,
        })
        player4: string | null,
        @SlashOption({
            name: "player5",
            description: "Teammate discord @name",
            required: false,
            type: ApplicationCommandOptionType.User,
        })
        player5: string | null,
        @SlashOption({
            name: "player6",
            description: "Teammate discord @name",
            required: false,
            type: ApplicationCommandOptionType.User,
        })
        player6: string | null,
        @SlashOption({
            name: "player7",
            description: "Teammate discord @name",
            required: false,
            type: ApplicationCommandOptionType.User,
        })
        player7: string | null,
        @SlashOption({
            name: "player8",
            description: "Teammate discord @name",
            required: false,
            type: ApplicationCommandOptionType.User,
        })
        player8: string | null,
        interaction: CommandInteraction
    ) {
        await interaction.reply("Time added to database");
    }
}
