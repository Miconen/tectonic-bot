import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import type { ChatInputCommandInteraction, GuildMember } from "discord.js";
import type { GuardFunction } from "discordx";

type ParseTimeResult = {
	hours?: number;
	minutes: number;
	seconds: number;
	milliseconds?: number;
};

type ParseTimeErrorObject = {
	errors: string[];
};

const MIN_TIMEUNIT = 0;
const MAX_HOURS = 23;
const MAX_MINUTES = 59;
const MAX_SECONDS = 59;
const MAX_MILLISECONDS = 59;

function parseTime(timeString: string): ParseTimeResult | ParseTimeErrorObject {
	const errors: string[] = [];
	const timeParts = timeString.split(":");
	let hasHours = false;
	let hasMilliseconds = false;

	// Check if the time string has the correct number of parts
	if (timeParts.length < 2 || timeParts.length > 3) {
		errors.push(
			getString("validation", "invalidTimeFormat", {
				error: "Expected formats: H:M:S, M:S.Ms or M:S",
			}),
		);
		// Return early as we rely this not to be the case moving forward
		return { errors };
	}

	// Check if hours and milliseconds coexist
	if (timeParts.length === 3 && timeParts[2].includes(".")) {
		errors.push(
			getString("validation", "invalidTimeFormat", {
				error: "Hours and milliseconds cannot coexist.",
			}),
		);
		// Return early as we rely this not to be the case moving forward
		return { errors };
	}

	if (timeParts.length === 2 && timeParts[1].includes(".")) {
		hasMilliseconds = true;
	} else if (timeParts.length === 3) {
		hasHours = true;
	}

	// Parse hours, minutes, and seconds
	const hours = hasHours ? Number.parseInt(timeParts[0], 10) : undefined;
	const minutes = Number.parseInt(hasHours ? timeParts[1] : timeParts[0], 10);
	const seconds = Number.parseInt(hasHours ? timeParts[2] : timeParts[1], 10);
	const milliseconds = hasMilliseconds
		? Number.parseInt(timeParts[1].split(".")[0], 10)
		: undefined;

	// Check if minutes are valid numeric values
	if (Number.isNaN(minutes)) {
		errors.push(
			getString("validation", "invalidTimeFormat", {
				error: "Expected numeric value for minutes.",
			}),
		);
		errors.push();
	}
	// Check if seconds are valid numeric values
	if (Number.isNaN(seconds)) {
		errors.push(
			getString("validation", "invalidTimeFormat", {
				error: "Expected numeric value for seconds.",
			}),
		);
		console.log(seconds);
	}

	// Check if minutes fall within the valid range
	if (minutes < MIN_TIMEUNIT || minutes > MAX_MINUTES) {
		errors.push(
			getString("validation", "invalidTimeRange", {
				error: `Minutes fall outside the valid range (${MIN_TIMEUNIT}-${MAX_MINUTES}).`,
			}),
		);
	}
	// Check if seconds fall within the valid range
	if (seconds < MIN_TIMEUNIT || seconds > MAX_SECONDS) {
		errors.push(
			getString("validation", "invalidTimeRange", {
				error: `Seconds fall outside the valid range (${MIN_TIMEUNIT}-${MAX_SECONDS}).`,
			}),
		);
	}

	// Parse hours if present
	if (hours) {
		// Check if hours is a valid number
		if (Number.isNaN(hours)) {
			errors.push(
				getString("validation", "invalidTimeFormat", {
					error: "Expected a numeric value for hours.",
				}),
			);
			// Check if hours fall within the valid range
			if (hours < MIN_TIMEUNIT || hours > MAX_HOURS) {
				errors.push(
					getString("validation", "invalidTimeFormat", {
						error: `Hours fall outside the valid range (${MIN_TIMEUNIT}-${MAX_HOURS}).`,
					}),
				);
			}
		}
		// Parse milliseconds if present
		if (milliseconds) {
			// Check if milliseconds is a valid number
			if (Number.isNaN(milliseconds)) {
				errors.push(
					getString("validation", "invalidTimeFormat", {
						error: "Expected a numeric value for milliseconds.",
					}),
				);
			}

			// Check if milliseconds fall within the valid range
			if (milliseconds < MIN_TIMEUNIT || milliseconds > MAX_MILLISECONDS) {
				errors.push(
					getString("validation", "invalidTimeFormat", {
						error: `Milliseconds fall outside the valid range (${MIN_TIMEUNIT}-${MAX_MILLISECONDS}).`,
					}),
				);
			}
		}
	}

	// Return the errors if any
	if (errors.length > 0) {
		return { errors };
	}

	// Return the parsed time components
	return {
		hours,
		minutes,
		seconds,
		milliseconds,
	};
}

function IsValidTime(option: string) {
	const guard: GuardFunction<ChatInputCommandInteraction> = async (
		interaction,
		_,
		next,
	) => {
		const member = interaction.member as GuildMember;
		const timeString = interaction.options.get(option)?.value;
		const timeStringType = interaction.options.get(option)?.type;

		console.log(
			`Checking time validity for: ${member.displayName} (${member.user.username}#${member.user.discriminator})`,
		);

		if (typeof timeString !== "string") {
			console.log(
				`↳ Invalid parameter type, expected a string, found: ${timeStringType}`,
			);
			return;
		}

		const time = parseTime(timeString);
		if ("errors" in time) {
			console.log("↳ Invalid time");
			console.error(`↳ ${time.errors}`);

			return await replyHandler(time.errors.join("\n"), interaction);
		}
		console.log("↳ Passed");
		await next();
	};

	return guard;
}

export default IsValidTime;
