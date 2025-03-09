import { notEmpty } from "@utils/notEmpty.js"
import {
    ApplicationCommandOptionType,
    CommandInteraction,
    GuildMember,
} from "discord.js"
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx"
import IsActivated from "@guards/IsActivated.js"
import IsAdmin from "@guards/IsAdmin.js"
import IsValidTime from "@guards/IsValidTime.js"
import { replyHandler } from "@utils/replyHandler.js"
import getBoss from "./func/getBoss.js"
import submitHandler from "./func/submitHandler.js"

@Discord()
@SlashGroup("pb")
@Guard(IsAdmin, IsValidTime("time"), IsActivated())
class hmtpb {
    @Slash({ name: "hmt", description: "Request your new pb to be added" })
    async hmt(
        @SlashOption({
            name: "time",
            description: "HMT pb time",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        time: string,
        @SlashOption({
            name: "player1",
            description: "Teammate discord @name",
            required: true,
            type: ApplicationCommandOptionType.User,
        })
        player1: GuildMember,
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
        interaction: CommandInteraction
    ) {
        let team = [
            player1.user.id,
            player2?.user.id,
            player3?.user.id,
            player4?.user.id,
            player5?.user.id,
        ].filter(notEmpty)

        await interaction.deferReply();
        let response = await submitHandler(getBoss("hmt", team), time, team, interaction)
        await replyHandler(response, interaction);
    }
}
