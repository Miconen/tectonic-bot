import capitalizeFirstLetter from "./capitalizeFirstLetter";

/**
 * Interface defining the structure of string templates
 */
// biome-ignore lint/suspicious/noExplicitAny: I don't know any other way to get this to work
type StringTemplate = string | ((args: Record<string, any>) => string);

/**
 * Interface for the string repository
 */
interface StringRepository {
	[category: string]: {
		[key: string]: StringTemplate;
	};
}

/**
 * Main string repository containing all application strings
 */
const strings: StringRepository = {
	ranks: {
		levelUpMessage: (args) =>
			`**${args.username}** ranked up to ${args.icon} ${capitalizeFirstLetter(args.rankName)}!`,
		pointsGranted: (args) =>
			`✔ **${args.username}** was granted ${args.pointsGiven} points by **${args.grantedBy}** and now has a total of ${args.totalPoints} points.`,
	},
	competitions: {
		header: (args) => `## ${args.title}`,
		participantCount: (args) => `Participants: ${args.count}`,
		eligibleCount: (args) => `Eligible for points: ${args.eligibleCount}`,
		pointsHeader: "\n## Points",
	},
	accounts: {
		unlinkedHeader: "\n## Unlinked accounts",
		unlinkedAccount: (args) =>
			`**${args.rsn}** +${args.pointsGiven} points, once Discord linked to RSN`,
		unlinkInstructions:
			"\n_Once you link your rsn to the bot you'll be eligible to gain event points_\n_Please tag leadership to help with linking your account with your rsn_",
		notActivated: (args) => `❌ **${args.username}** is not an activated user.`,
	},
	errors: {
		noGuild: "This command must be used in a guild.",
		noMember: "Couldn't retrieve member information.",
		competitionError: "Failed to retrieve competition data.",
		givingPoints: "Error giving points.",
		apiError: (args) => `Error ${args.activity}.\n\`${args.error}\``,
		empty: (args) => `Error accessing empty ${args.target}.`,
	},
};

/**
 * Gets a string from the repository
 * @param category - The category of the string
 * @param key - The key of the string within the category
 * @param args - Optional arguments to format the string
 * @returns The formatted string
 */
export function getString(
	category: string,
	key: string,
	// biome-ignore lint/suspicious/noExplicitAny: I don't know any other way to get this to work
	args?: Record<string, any>,
): string {
	const c = strings[category];
	if (!c) {
		console.warn(`String not found: ${category}.${key}`);
		return `[${category}.${key}]`;
	}

	const k = c[key];
	if (!k) {
		console.warn(`String not found: ${category}.${key}`);
		return `[${category}.${key}]`;
	}

	const template = k;

	if (typeof template === "function" && args) {
		return template(args);
	}
	if (typeof template === "string") {
		return template;
	}
	console.warn(`Missing arguments for string template: ${category}.${key}`);
	return `[${category}.${key}:missing-args]`;
}

/**
 * Gets multiple strings as an array and joins them with a separator
 * @param stringRequests - Array of string requests
 * @param separator - Separator to join the strings with
 * @returns The joined strings
 */
export function getMultipleStrings(
	stringRequests: Array<{
		category: string;
		key: string;
		// biome-ignore lint/suspicious/noExplicitAny: I don't know any other way to get this to work
		args?: Record<string, any>;
	}>,
	separator = "\n",
): string {
	return stringRequests
		.map((request) => getString(request.category, request.key, request.args))
		.join(separator);
}

export default { getString, getMultipleStrings };
