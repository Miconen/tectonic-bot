import { Discord, Slash, SlashGroup } from "discordx";
import { CommandInteraction } from "discord.js";
import splitHelp from "./func/splitHelp.js";
import pointsHelp from "./func/pointsHelp.js";
import bumpHelp from "./func/bumpHelp.js";
import ranksHelp from "./func/ranksHelp.js";

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
    ranks(interaction: CommandInteraction) {
        return ranksHelp(interaction);
    }

    @Slash({
        name: "points",
        description: "Information about points",
    })
    points(interaction: CommandInteraction) {
        return pointsHelp(interaction);
    }

    @Slash({
        name: "bump",
        description: "Information about bumping the forum post",
    })
    bump(interaction: CommandInteraction) {
        return bumpHelp(interaction);
    }

    @Slash({ name: "split", description: "Information about splitting" })
    split(interaction: CommandInteraction) {
        return splitHelp(interaction);
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
