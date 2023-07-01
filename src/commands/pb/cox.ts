import { ApplicationCommandOptionType, CommandInteraction, GuildMember } from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import IsValidTime from "../../guards/IsValidTime.js";
import getBoss from "./func/getBoss.js";
import submitHandler from "./func/submitHandler.js";


@Discord()
@SlashGroup("pb")
@Guard(IsValidTime("time"))
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
            type: ApplicationCommandOptionType.User,
        })
        player2: GuildMember | null,
        @SlashOption({
            name: "player3",
            description: "Teammate discord @name",
            required: false,
            type: ApplicationCommandOptionType.User,
        })
        player3: GuildMember | null,
        @SlashOption({
            name: "player4",
            description: "Teammate discord @name",
            required: false,
            type: ApplicationCommandOptionType.User,
        })
        player4: GuildMember | null,
        @SlashOption({
            name: "player5",
            description: "Teammate discord @name",
            required: false,
            type: ApplicationCommandOptionType.User,
        })
        player5: GuildMember | null,
        @SlashOption({
            name: "player6",
            description: "Teammate discord @name",
            required: false,
            type: ApplicationCommandOptionType.User,
        })
        player6: GuildMember | null,
        @SlashOption({
            name: "player7",
            description: "Teammate discord @name",
            required: false,
            type: ApplicationCommandOptionType.User,
        })
        player7: GuildMember | null,
        @SlashOption({
            name: "player8",
            description: "Teammate discord @name",
            required: false,
            type: ApplicationCommandOptionType.User,
        })
        player8: GuildMember | null,
        interaction: CommandInteraction,
    ) {
        let team = [
            interaction.user.id,
            player2?.user.id,
            player3?.user.id,
            player4?.user.id,
            player5?.user.id,
            player6?.user.id,
            player7?.user.id,
            player8?.user.id,
        ];

        await submitHandler(getBoss("cox", team), time, team, interaction);
        await interaction.reply("Time submitted");
    }
}
