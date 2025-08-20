const HOUR: number = 3600000;
const MINUTE: number = 60000;
const SECOND: number = 1000;
/** A singular game tick, one 100th of a minute. */
const TICK: number = 600;

function timeToMilliseconds(time: string): number {
	const timeComponents = time.split(":");
	const numComponents = timeComponents.length;

	let milliseconds = 0;
	if (numComponents === 3) {
		const [hours, minutes, seconds] = timeComponents;
		milliseconds =
			Number(hours) * HOUR +
			Number(minutes) * MINUTE +
			Number(seconds) * SECOND;
	} else if (numComponents === 2) {
		const [minutes, secondsAndMilliseconds] = timeComponents;
		const [seconds, millisecondsStr] = secondsAndMilliseconds.split(".");
		const millisecondsPart = millisecondsStr
			? Number(millisecondsStr.padEnd(3, "0"))
			: 0;
		milliseconds =
			Number(minutes) * MINUTE + Number(seconds) * SECOND + millisecondsPart;
	} else if (numComponents === 1) {
		const millisecondsStr = timeComponents[0];
		milliseconds = millisecondsStr ? Number(millisecondsStr) : 0;
	}

	return milliseconds;
}

function millisecondsToTime(milliseconds: number): string {
	// Calculate hours
	const hours = Math.floor(milliseconds / HOUR);
	let remainder = milliseconds % HOUR;

	// Calculate minutes
	const minutes = Math.floor(remainder / MINUTE);
	remainder %= MINUTE;

	// Calculate seconds
	const seconds = Math.floor(remainder / SECOND);

	// Calculate remaining milliseconds
	remainder %= SECOND;
	const millisecondsStr = remainder.toString().padStart(2, "0").slice(0, 2);

	if (hours > 0) {
		return `${hours.toString().padStart(2, "0")}:${minutes
			.toString()
			.padStart(2, "0")}:${seconds
			.toString()
			.padStart(2, "0")}.${millisecondsStr}`;
	}
	if (minutes > 0) {
		return `${minutes.toString().padStart(2, "0")}:${seconds
			.toString()
			.padStart(2, "0")}.${millisecondsStr}`;
	}
	return `${seconds.toString().padStart(2, "0")}.${millisecondsStr}`;
}

function timeToTicks(time: string): number {
	const totalMilliseconds = timeToMilliseconds(time);
	const ticks = totalMilliseconds / TICK;
	return Math.ceil(ticks);
}

function ticksToTime(ticks: number): string {
	const milliseconds = ticks * TICK;
	return millisecondsToTime(milliseconds);
}

const TimeConverter = {
	timeToMilliseconds,
	millisecondsToTime,
	timeToTicks,
	ticksToTime,
};

export default TimeConverter;
