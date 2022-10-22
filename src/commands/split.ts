import {
    ButtonInteraction,
    CommandInteraction,
    GuildMember,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageActionRowComponentBuilder,
    ApplicationCommandOptionType,
} from 'discord.js';
import {
    Discord,
    Slash,
    ButtonComponent,
    SlashChoice,
    SlashOption,
} from 'discordx';
import IsAdmin from '../utility/isAdmin.js';
import pointsHandler, {PointRewardsMap} from '../data/pointHandling.js';
import givePoints from "../utility/givePoints.js";

const interactionMap = new Map<string, CommandInteraction>();
const interactionState = new Map<string, boolean>();
const pointsMap = new Map<string, number>();

const getInteractionId = (interaction: ButtonInteraction) => {
    if (interaction.message.interaction?.id) console.log("ERROR: Interaction ID defaulted to 0");
    return interaction.message.interaction?.id ?? '0';
};

const isValid = async (interaction: ButtonInteraction) => {
    let interactionId = getInteractionId(interaction);
    // return if not admin
    if (!IsAdmin(Number(interaction.member?.permissions))) return false;
    // If command has not been stored in memory, don't run.
    // Idea is not to handle commands that haven't been stored since restart.
    if (!interactionState.has(interactionId)) {
        await interaction.reply('❌ Point request expired...');
        return false;
    }
    // If command has been run once, don't run again. Returns true if ran once.
    if (interactionState.get(interactionId)) {
        await interaction.reply('❌ Points already handled');
        return false;
    }
    return true;
};

@Discord()
class split {
    @Slash({name: 'split', description: 'Receive points for splitting'})
    async split(
        @SlashChoice({
            name: '2-100m',
            value: PointRewardsMap.get('split_low'),
        })
        @SlashChoice({
            name: '100-500m',
            value: PointRewardsMap.get('split_medium'),
        })
        @SlashChoice({
            name: '500m+',
            value: PointRewardsMap.get('split_high'),
        })
        @SlashOption({
            name: 'value',
            description: 'Value of the split drop?',
            required: true,
            type: ApplicationCommandOptionType.Number,
        })
        value: number,
        interaction: CommandInteraction
    ) {
        await interaction.deferReply();
        value = await pointsHandler(value, interaction.guild!.id);

        // Create the button, giving it the id: "approve-btn"
        const approveButton = new ButtonBuilder()
            .setLabel('Approve')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('approve-btn');

        // Create a button, giving it the id: "deny-btn"
        const denyButton = new ButtonBuilder()
            .setLabel('Deny')
            .setStyle(ButtonStyle.Danger)
            .setCustomId('deny-btn');

        // Create a MessageActionRow and add the button to that row.
        const row =
            new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                approveButton,
                denyButton
            );

        const msg = `${(interaction.member as GuildMember).displayName} has submitted a request for ${value} points. Please wait for admin approval and make sure you have posted a screenshot of your drop as proof.`;
        await interaction.editReply({
            content: msg,
            components: [row],
        });

        interactionMap.set(interaction.id, interaction);
        interactionState.set(interaction.id, false);
        pointsMap.set(interaction.id, value);
    }

    // register a handler for the button with id: "approve-btn"
    @ButtonComponent({id: 'approve-btn'})
    async approveButton(interaction: ButtonInteraction) {
        if (!await isValid(interaction)) return;

        let addedPoints = pointsMap.get(getInteractionId(interaction)) ?? 0;

        // let points = await updateUserPoints(interaction.guild!.id, interaction.message.interaction!.user.id, addedPoints);
        //
        // if (points) {
        //     response = `✔️ ${interaction.message.interaction?.user} Points approved by ${interaction.member}. ${interaction.message.interaction?.user} recieved ${points} points and now has a total of ${res} points.`;
        //     rankUpHandler(interactionMap.get(getInteractionId(interaction))!, interaction.member as GuildMember, res.points - points!, res.points);
        //
        //     let interactionId = getInteractionId(interaction);
        //     interactionState.set(interactionId, true);
        // }
        //
        // Handle giving of points, returns a string to be sent as a message.
        let response = await givePoints(addedPoints, interaction.member as GuildMember, interaction.message.interaction as CommandInteraction);
        await interaction.reply(response);
    }

    // register a handler for the button with id: "deny-btn"
    @ButtonComponent({id: 'deny-btn'})
    async denyButton(interaction: ButtonInteraction) {
        if (!await isValid(interaction)) return;
        await interaction.reply(
            `❌ ${interaction.message.interaction?.user} Points denied by admin.`
        );
        let interactionId = getInteractionId(interaction);
        interactionState.set(interactionId, true);
    }
}
