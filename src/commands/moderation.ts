import { Discord, Slash, SlashOption, SlashGroup } from "discordx";
import {
    CommandInteraction,
    EmbedBuilder,
    GuildMember,
    ApplicationCommandOptionType,
} from "discord.js";
import { Pagination } from "@discordx/pagination";
import IsAdmin from "../utility/isAdmin.js";
import getLeaderboard from "../data/database/getLeaderboard.js";
import setPointMultiplier from "../data/database/setPointMultiplier.js";
import givePoints from "../utility/givePoints.js";

@Discord()
@SlashGroup({ name: "moderation", description: "Moderation related commands" })
@SlashGroup("moderation")
class Moderation {
    @Slash({ name: "give", description: "Give points to a user" })
    async give(
        @SlashOption({
            name: "username",
            description: "@User tag to give points to",
            required: true,
            type: ApplicationCommandOptionType.User,
        })
        @SlashOption({
            name: "amount",
            description: "Amount of points to give",
            required: true,
            type: ApplicationCommandOptionType.Number,
        })
        channel: GuildMember,
        addedPoints: number,
        interaction: CommandInteraction,
    ) {
        if (!IsAdmin(Number(interaction.member?.permissions))) return;

        // Handle giving of points, returns a string to be sent as a message.
        await givePoints(addedPoints, channel, interaction);
    }

    // @Slash('leaderboard')
    // leaderboard(interaction: CommandInteraction) {
    // 	let result = getLeaderboard(
    // 		interaction.guildId!,
    // 	);
    // 	if (!IsAdmin(Number(interaction.member?.permissions))) return;

    // 	let botIconUrl = interaction.client.user?.avatarURL() ?? '';

    // 	const embedMaker = (): EmbedBuilder => {
    // 		return new EmbedBuilder()
    // 			.setTitle('Tectonic Leaderboard')
    // 			.setAuthor({
    // 				name: 'Tectonic Bot',
    // 				url: 'https://github.com/Miconen/tectonic-bot',
    // 				iconURL: botIconUrl,
    // 			})
    // 			.setColor('#0099ff')
    // 			.setTimestamp();
    // 	};

    // 	result
    // 		.then((res) => {
    // 			console.log(res);

    // 			let pages: any = [];
    // 			const pageMaker = (i: number) => {
    // 				let fields = res.slice(i, i + 10);

    // 				console.log(fields);
    // 				return {
    // 					embeds: [
    // 						embedMaker()
    // 							.setFooter({
    // 								text: `Page ${i + 1} (${i + 1}-${i + 10}) - /rsn set if you're not on the list.`,
    // 							})
    // 							.addFields(
    // 								// -1 cause dealing with array indexes starting at 0
    // 								...fields
    // 							),
    // 					],
    // 				};
    // 			};
    // 			for (let i = 0; i <= res.length; i++) {
    // 				if (i % 10 == 0) pages.push(pageMaker(i));
    // 			}

    // 			new Pagination(interaction, [...pages]).send();
    // 		})
    // 		.catch((err) => {
    // 			console.log(err);

    // 			interaction.reply('Error getting leaderboard');
    // 		});
    // }
    @Slash({
        name: "setmultiplier",
        description: "Set a server vide point multiplier",
    })
    async setmultiplier(
        @SlashOption({
            name: "multiplier",
            description: "Number that all points given will get multiplied by",
            required: true,
            type: ApplicationCommandOptionType.Number,
        })
        multiplier: number,
        interaction: CommandInteraction,
    ) {
        if (!IsAdmin(Number(interaction.member?.permissions))) return;

        let newMultiplier = await setPointMultiplier(
            interaction.guild!.id,
            multiplier,
        );

        let response: string;
        if (newMultiplier) {
            response = `Updated server point multiplier to ${newMultiplier}`;
        } else {
            response = "Something went wrong...";
        }

        await interaction.reply(response);
    }
}
