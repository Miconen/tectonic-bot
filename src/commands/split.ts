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
import IsAdmin from '../utility/isAdmin';

/*
TODO
Implement bob
do database stuff
make it into a slash choice thingy
*/

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

		// Prevent approving the split multiple times using this state

		// Create the button, giving it the id: "yep-btn"
		const approveButton = new MessageButton()
			.setLabel('')
			.setEmoji('✅')
			.setStyle('SUCCESS')
			.setCustomId('yep-btn');

		// Create a button, giving it the id: "deny-btn"
		const denyButton = new MessageButton()
			.setLabel('')
			.setEmoji('🈲')
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
	}

	// register a handler for the button with id: "yep-btn"
	@ButtonComponent('yep-btn')
	approveButton(interaction: ButtonInteraction) {
		// return if not admin
		if (!IsAdmin(interaction)) return;
		interaction.reply(`✅ ${interaction.member} Points approved by admin.`);
	}

	// register a handler for the button with id: "deny-btn"
	@ButtonComponent('deny-btn')
	denyButton(interaction: ButtonInteraction) {
		// return if not admin
		if (!IsAdmin(interaction)) return;
		interaction.reply(`🈲 ${interaction.member} Points denied by admin.`);
	}
}
