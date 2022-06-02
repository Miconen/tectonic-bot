function IsAdmin(bitfield: number) {
	/*
	 *   Would not recomend trying to understand this
	 */

	//binary operations spaggeti, admin flag is bit 40....
	const admin_flag =
		(BigInt(Number(bitfield?.valueOf())) & (1n << 40n)) >> 40n;

	return admin_flag;
}

export default IsAdmin;
