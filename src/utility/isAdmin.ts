import type { ButtonInteraction } from 'discord.js';

function IsAdmin(a: ButtonInteraction) {
	/*
	 *   Would not recomend trying to understand this
	 */

	//gets the users premmision bitfield/bigint thingy
	const Bit_field = a.member?.permissions;

	//binary operations spaggeti, admin flag is bit 40....
	const admin_flag =
		(BigInt(Number(Bit_field?.valueOf())) & (1n << 40n)) >> 40n;

	return admin_flag;
	//console.log(typeof(Bit_field?.valueOf()));
	//console.log((BigInt(Number(Bit_field?.valueOf())) & (1n << 40n)) >> 40n);
	//console.log(interaction.member?.roles);
	//console.log("----------------------------------");
	//console.log(interaction.member?.permissions);
}

export default IsAdmin;
