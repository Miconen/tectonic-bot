import {
	ButtonInteraction,
	CommandInteraction,
	MessageActionRow,
	MessageButton,
} from 'discord.js';
import {
	Discord,
	Slash,
	ButtonComponent,
	SlashChoice,
	SlashOption,
} from 'discordx';
import IsAdmin from '../utility/isAdmin.js';
import newUser from '../data/database/updateUserPoints.js';
import updateUserPoints from '../data/database/updateUserPoints.js';

/*
TODO
Implement bob
do database stuff
make it into a slash choice thingy
*/

const interactionMap = new Map<string, CommandInteraction>();
const interactionState = new Map<string, boolean>();
const pointsMap = new Map<string, number>();

const getInteractionId = (interaction: ButtonInteraction) => {
	if (!interaction.message.interaction?.id) return '0';
	return interaction.message.interaction!.id;
};

const isValid = (interaction: ButtonInteraction) => {
	let interactionId = getInteractionId(interaction);
	// return if not admin
	if (!IsAdmin(Number(interaction.member?.permissions))) return false;
	// If command has not been stored in memory, don't run.
	// Idea is not to handle commands that haven't been stored since restart.
	if (!interactionState.has(interactionId)) {
		interaction.reply('❌ Point request expired...');
		return false;
	}
	// If command has been run once, don't run again. Returns true if ran once.
	if (interactionState.get(interactionId)) {
		interaction.reply('❌ Points already handled');
		return false;
	}

	interactionState.set(interactionId, true);
	return true;
};

@Discord()
class split {
	@Slash('split')
	async split(
		@SlashChoice({ name: '2-100m', value: 10 })
		@SlashChoice({ name: '100-500m', value: 20 })
		@SlashChoice({ name: '500m+', value: 30 })
		@SlashOption('value', { description: 'Value of the split drop?' })
		value: number,
		interaction: CommandInteraction
	) {
		await interaction.deferReply();

		// Create the button, giving it the id: "approve-btn"
		const approveButton = new MessageButton()
			.setLabel('Approve')
			.setStyle('SUCCESS')
			.setCustomId('approve-btn');

		// Create a button, giving it the id: "deny-btn"
		const denyButton = new MessageButton()
			.setLabel('Deny')
			.setStyle('DANGER')
			.setCustomId('deny-btn');

		// Create a MessageActionRow and add the button to that row.
		const row = new MessageActionRow().addComponents(
			approveButton,
			denyButton
		);

		const msg = `You have submitted a request for ${value} points please wait for admin approval, and make sure you have posted the appropriate screenshots`;
		interaction.editReply({
			content: msg,
			components: [row],
		});

		interactionMap.set(interaction.id, interaction);
		interactionState.set(interaction.id, false);
		pointsMap.set(interaction.id, value);
	}

	// register a handler for the button with id: "approve-btn"
	@ButtonComponent('approve-btn')
	approveButton(interaction: ButtonInteraction) {
		if (!isValid(interaction)) return;

		let points = pointsMap.get(getInteractionId(interaction));

		let result = 0;
		const callback = (resultPoints: number) => {
			result = resultPoints;

			if (!result) {
				interaction.reply(
					`❌ ${interaction.message.interaction?.user} Is not an activated user.`
				);
				return;
			}
			interaction.reply(
				// Show who approved the points
				`✔️ ${interaction.message.interaction?.user} Points approved by ${interaction.member}. ${interaction.message.interaction?.user} recieved ${points} points and now has a total of ${result} points.`
			);
		};

		updateUserPoints(
			interaction.guild!.id,
			interaction.message.interaction!.user.id,
			points!,
			callback
		);
	}

	// register a handler for the button with id: "deny-btn"
	@ButtonComponent('deny-btn')
	denyButton(interaction: ButtonInteraction) {
		if (!isValid(interaction)) return;
		interaction.reply(
			// Don't show who denied the points
			`❌ ${interaction.message.interaction?.user} Points denied by admin.`
		);
	}
}
