import { Discord, Slash, SlashGroup } from "discordx";
import { CommandInteraction } from "discord.js";
import pointsHandler, { PointRewardsMap } from "../data/pointHandling.js";
import { roleIcon } from "../data/iconData.js";
import { roleValuesByName } from "../data/roleData.js";

@Discord()
@SlashGroup({ name: "help", description: "Commands to help you use commands" })
@SlashGroup("help")
class Help {
    @Slash({
        name: "commands",
        description: "Information about all commands",
    })
    async commands(interaction: CommandInteraction) {
        await interaction.reply(
            `Information on how to use the bot along with it's commands is provided here: https://github.com/Miconen/tectonic-bot/blob/main/README.md#commands`,
        );
    }

    @Slash({
        name: "ranks",
        description: "Information about all the ranks",
    })
    async ranks(interaction: CommandInteraction) {
        let response =
            `**Ranks**:\n\n` +
            `${roleIcon.get("jade")} Jade - ${roleValuesByName.get(
                "jade",
            )} points\n` +
            `${roleIcon.get("red_topaz")} Red Topaz - ${roleValuesByName.get(
                "red_topaz",
            )} points\n` +
            `${roleIcon.get("sapphire")} Sapphire - ${roleValuesByName.get(
                "sapphire",
            )} points\n` +
            `${roleIcon.get("emerald")} Emerald - ${roleValuesByName.get(
                "emerald",
            )} points\n` +
            `${roleIcon.get("ruby")} Ruby - ${roleValuesByName.get(
                "ruby",
            )} points\n` +
            `${roleIcon.get("diamond")} Diamond - ${roleValuesByName.get(
                "diamond",
            )} points\n` +
            `${roleIcon.get(
                "dragonstone",
            )} Dragonstone - ${roleValuesByName.get("dragonstone")} points\n` +
            `${roleIcon.get("onyx")} Onyx - ${roleValuesByName.get(
                "onyx",
            )} points\n` +
            `${roleIcon.get("zenyte")} Zenyte - ${roleValuesByName.get(
                "zenyte",
            )} points\n`;

        await interaction.reply(response);
    }

    @Slash({
        name: "points",
        description: "Information about points",
    })
    async points(interaction: CommandInteraction) {
        let response =
            `**Point sources**:\n\n` +
            `**Splits**:\n` +
            `Low value: ${PointRewardsMap.get("split_low")}\n` +
            `Medium value: ${PointRewardsMap.get("split_medium")}\n` +
            `High value: ${PointRewardsMap.get("split_high")}` +
            `\n\n` +
            `**Events**:\n` +
            `Participation: ${PointRewardsMap.get("event_participation")}\n` +
            `Hosting: ${PointRewardsMap.get("event_hosting")}` +
            `\n\n` +
            `**Learners**:\n` +
            `Half: ${PointRewardsMap.get("learner_half")}\n` +
            `Full: ${PointRewardsMap.get("learner_full")}` +
            `\n\n` +
            `**Forum**:\n` +
            `Bumping: ${PointRewardsMap.get("forum_bump")}`;

        await interaction.reply(response);
    }

    @Slash({
        name: "bump",
        description: "Information about bumping the forum post",
    })
    async bump(interaction: CommandInteraction) {
        let points = await pointsHandler(
            PointRewardsMap.get("forum_bump"),
            interaction.guild!.id,
        );

        await interaction.reply(
            `You can gain points for bumping our forum post here: https://secure.runescape.com/m=forum/a=13/c=tuplIA8cxpE/forums?320,321,794,66254540,goto,1\nPoint reward: ${points}`,
        );
    }

    @Slash({ name: "split", description: "Information about splitting" })
    async split(interaction: CommandInteraction) {
        let points_low = await pointsHandler(
            PointRewardsMap.get("split_low"),
            interaction.guild!.id,
        );
        let points_medium = await pointsHandler(
            PointRewardsMap.get("split_medium"),
            interaction.guild!.id,
        );
        let points_high = await pointsHandler(
            PointRewardsMap.get("split_high"),
            interaction.guild!.id,
        );

        await interaction.reply(
            `Gain points for recieving a drop and splitting with your clan mates, screenshot of loot and teammates names required as proof.\nRequires user to be an activated user\nPoint rewards: ${points_low}, ${points_medium} & ${points_high}`,
        );
    }

    @Slash({
        name: "activate",
        description: "Information about activating clan members",
    })
    async activate(interaction: CommandInteraction) {
        await interaction.reply(
            `Admin only command, used to activate new member of the community. This command handles all automation for new users and allows them to gain points/ranks. This should be used on all new users that are a part of the clan.`,
        );
    }

    @Slash({ name: "github", description: "Information about the bot" })
    async github(interaction: CommandInteraction) {
        await interaction.reply(
            "Link to Tectonic Bot repository: https://github.com/Miconen/tectonic-bot if you want to contribute @ Comfy hug",
        );
    }
}

@Discord()
@SlashGroup({
    name: "rsn",
    description: "Help for the rsn related commands",
    root: "help",
})
@SlashGroup("rsn", "help")
class HelpRsn {
    @Slash({ name: "set", description: "Information about setting your rsn" })
    async set(interaction: CommandInteraction) {
        await interaction.reply(
            "Temporarily admin only command, bind your osrs account(s) to your discord user.",
        );
    }

    @Slash({
        name: "lookup",
        description: "Information about other clan members osrs accounts",
    })
    async lookup(interaction: CommandInteraction) {
        await interaction.reply("Lookup discord users osrs account(s)");
    }
}
