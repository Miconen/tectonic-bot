function IsAdmin(input: number) {
	let bitfield = BigInt(input);
	return (bitfield & (1n << 40n)) >> 40n;
}

export default IsAdmin;
