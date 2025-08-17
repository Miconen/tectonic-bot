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
		pointsGrantedMultiple: (args) =>
			`✔ **${args.usernames}** were granted ${args.pointsGiven} points by **${args.grantedBy}**.`,
		roleAdded: (args) =>
			`Added role **${args.roleName}** to **${args.username}**.`,
		roleRemoved: (args) => `Removed all rank roles from **${args.username}**.`,
		rankInfo: (args) =>
			`${args.icon} **${args.username}** has: ${args.points} points`,
		rankInfoWithNext: (args) =>
			`${args.currentIcon} **${args.username}** has: ${args.points} points\n${args.nextIcon} Points to next level: ${args.pointsToNext}`,
		maxRankReached: (args) =>
			`**${args.username}** has reached the maximum rank!`,
	},

	competitions: {
		header: (args) => `## ${args.title}`,
		participantCount: (args) => `Participants: ${args.count}`,
		eligibleCount: (args) => `Eligible for points: ${args.eligibleCount}`,
		pointsHeader: "\n## Points",
		eventEnded: (args) =>
			`Event **${args.eventName}** has ended. Processing results...`,
		eventProcessed: (args) =>
			`Event results processed. ${args.participantCount} participants awarded points.`,
		noEligibleParticipants: "No eligible participants found for this event.",
		eventNotFound: (args) => `Event with ID ${args.eventId} not found.`,
		teamResultsProcessed: (args) =>
			`Team event processed. ${args.teamCount} teams awarded points.`,
	},

	accounts: {
		unlinkedHeader: "\n## Unlinked accounts",
		unlinkedAccount: (args) =>
			`**${args.rsn}** +${args.pointsGiven} points, once Discord linked to RSN`,
		unlinkInstructions:
			"\n_Once you link your rsn to the bot you'll be eligible to gain event points_\n_Please tag leadership to help with linking your account with your rsn_",
		notActivated: (args) => `❌ **${args.username}** is not an activated user.`,
		activated: (args) =>
			`✔ **${args.username}** has been activated and linked.`,
		deactivated: (args) => `✔ **${args.username}** has been deactivated.`,
		alreadyActivated: (args) => `❌ **${args.username}** is already activated.`,
		rsnAdded: (args) => `✔ Added RSN **${args.rsn}** to **${args.username}**.`,
		rsnRemoved: (args) =>
			`✔ Removed RSN **${args.rsn}** from **${args.username}**.`,
		rsnNotFound: (args) =>
			`❌ RSN **${args.rsn}** not found for **${args.username}**.`,
		rsnAlreadyExists: (args) =>
			`❌ RSN **${args.rsn}** already exists for **${args.username}**.`,
		rsnListHeader: (args) => `## ${args.username} RSNs`,
		rsnSuccessfullyAdded: (args) =>
			`Successfully added new RSN (**${args.rsn}**)\n`,
		noLinkedAccounts:
			"`Link your OSRS account to be eligible for event rank points`",
	},

	achievements: {
		request: (args) =>
			`# Achievement Request\n\nUser: ${args.username}\nRSN: ${args.rsn}\nAchievement: ${args.achievement}`,
		granted: (args) =>
			`✔ Granted achievement **${args.achievement}** to **${args.username}** (${args.rsn}).`,
		removed: (args) =>
			`✔ Removed achievement **${args.achievement}** from **${args.username}** (${args.rsn}.`,
		alreadyHas: (args) =>
			`❌ **${args.username}** already has achievement **${args.achievement}**.`,
		notFound: (args) => `❌ Achievement **${args.achievement}** not found.`,
		userNotFound: (args) => "❌ User not found for achievement operation.",
		requestSubmitted: (args) =>
			`Achievement request submitted for **${args.achievement}**. Please wait for admin approval.`,
	},

	splits: {
		requestSubmitted: (args) =>
			`**${args.username}** has submitted a request for ${args.points} points. Please wait for admin approval and make sure you have posted a screenshot of your drop as proof.`,
		approved: (args) =>
			`✔ Split request approved for **${args.username}** - ${args.points} points awarded.`,
		denied: (args) => `❌ **${args.username}** point request was denied.`,
		notFound: "❌ Split request not found or expired.",
		infoHeader: (args) => `# Split: ${args.username}`,
		infoDetails: (args) =>
			`Points: ${args.points} points\nCreated: ${args.timeAgo}\nMessage: ${args.messageUrl}`,
		helpText: (args) =>
			`Gain points for receiving a drop and splitting with your clan mates, screenshot of loot and teammates names required as proof.\nRequires user to be an activated user\nPoint rewards: ${args.lowPoints}, ${args.mediumPoints} & ${args.highPoints}`,
	},

	profile: {
		header: (args) => `# ${args.rankIcon} **${args.username}**`,
		currentPoints: (args) => `Current points: ${args.points}${args.rankIcon}`,
		pointsToNext: (args) =>
			`Points to next level: ${args.pointsToNext}${args.nextRankIcon}`,
		accountsHeader: "# Accounts",
		pbsHeader: "# Clan PBs",
		eventsHeader: "# Event placements",
		pbEntry: (args) =>
			`\`${args.category} | ${args.displayName}\` - \`${args.time} (${args.ticks} ticks)\``,
		eventEntry: (args) =>
			`[${args.eventName}](https://wiseoldman.net/competitions/${args.womId}) - Placement: #${args.placement}`,
		accountEntry: (args) => `\`${args.rsn}\``,
		noAccounts: "No linked accounts found.",
		noPbs: "No personal bests recorded.",
		noEvents: "No event placements recorded.",
	},

	leaderboard: {
		title: "Tectonic Leaderboard",
		entry: (args) => `#${args.rank} **${args.username}** (${args.rsns})`,
		entryValue: (args) =>
			`${args.rankIcon} ${args.points} points | Accounts: ${args.accountCount}`,
		footer: (args) => `Page ${args.page} (${args.start}-${args.end})`,
		noUsers: "No activated users found for leaderboard.",
		loading: "Loading leaderboard...",
	},

	learner: {
		halfPoints: (args) =>
			`Half learner points (${args.points}) awarded to **${args.username}**.`,
		fullPoints: (args) =>
			`Full learner points (${args.points}) awarded to **${args.username}**.`,
	},

	moderation: {
		pointsGiven: (args) =>
			`Gave ${args.points} points to **${args.username}**.`,
		multiplierSet: (args) =>
			`Updated server point multiplier to ${args.multiplier}.`,
		guildInitialized: "Guild initialized successfully.",
		guildAlreadyExists: "Guild is already initialized.",
	},

	times: {
		newRecord: (args) =>
			`🏆 New ${args.category} record! **${args.displayName}**: ${args.time}`,
		timeImproved: (args) =>
			`⚡ **${args.displayName}** time improved: ${args.oldTime} → ${args.newTime}`,
		timeAdded: (args) =>
			`✔ Time recorded for **${args.displayName}**: ${args.time}`,
		invalidTime:
			"Invalid time format. Please use M:S, M:S.Ms, or H:M:S format.",
		bossNotFound: (args) => `Boss **${args.bossName}** not found.`,
		timeNotFound: "No time records found.",
		teamEntry: (args) => `Team: ${args.teammates}`,
	},

	help: {
		commandsInfo:
			"Information on how to use the bot along with its commands is provided here: https://github.com/Miconen/tectonic-bot/blob/main/README.md#commands",
		pointsSourcesHeader: "**Point sources**:",
		splitsHeader: "**Splits**:",
		eventsHeader: "**Events**:",
		learnersHeader: "**Learners**:",
		forumHeader: "**Forum**:",
		ranksHeader: "## Ranks:",
		pointValue: (args) => `${args.name}: ${args.points}`,
		rankEntry: (args) => `${args.icon} ${args.name} - ${args.points} points`,
	},

	validation: {
		invalidRsn:
			"Invalid RSN format. RSN must be 1-12 characters containing only letters, numbers, spaces, underscores, and hyphens.",
		invalidPoints: (args) =>
			`Invalid points amount. Must be between ${args.min} and ${args.max}.`,
		invalidUser: "Invalid user. Please mention a valid Discord user.",
		invalidTime:
			"Invalid time format. Please use M:S, M:S.Ms, or H:M:S format.",
		invalidChoice: (args) =>
			`Invalid choice. Valid options: ${args.options.join(", ")}`,
		required: (args) => `${args.field} is required.`,
		tooLong: (args) =>
			`${args.field} is too long. Maximum ${args.max} characters.`,
		tooShort: (args) =>
			`${args.field} is too short. Minimum ${args.min} characters.`,
		conflictingParams: (args) =>
			`Cannot use both ${args.param1} and ${args.param2} at the same time.`,
		userNotInGuild: "User is not a member of this server.",
	},

	permissions: {
		adminRequired:
			"You do not have the required permissions for this action. Administrator permissions required.",
		moderatorRequired:
			"You do not have the required permissions for this action. Moderator permissions required.",
		activatedRequired:
			"This command requires you to be an activated user. Please contact an administrator.",
		insufficientPerms: (args) =>
			`Insufficient permissions. Required: ${args.required}`,
		commandDisabled: "This command is currently disabled.",
		rateLimited: (args) =>
			`Rate limit exceeded. Try again in ${args.seconds} seconds.`,
	},

	errors: {
		noGuild: "This command must be used in a server.",
		noMember: "Could not retrieve member information.",
		competitionError: "Failed to retrieve competition data.",
		givingPoints: "Error giving points. Please try again.",
		apiError: (args) => `Error ${args.activity}.\n\`${args.error}\``,
		apiHealth:
			"Cannot reach the application server. Please try again in 30 seconds.",
		empty: (args) => `Error accessing empty ${args.target}.`,
		internalError: "An internal error occurred. Please try again.",
		networkError: "Network error. Please check your connection and try again.",
		timeout: "Request timed out. Please try again.",
		notFound: (args) => `${args.resource} not found.`,
		alreadyExists: (args) => `${args.resource} already exists.`,
		invalidFormat: (args) => `Invalid ${args.field} format.`,
		unavailable: (args) =>
			`${args.service} is currently unavailable. Please try again later.`,
		maintenance:
			"The bot is currently under maintenance. Please try again later.",
		rateLimitExceeded: "Too many requests. Please slow down.",
		commandFailed: (args) => `Command failed: ${args.reason}`,
		databaseError: "Database error occurred. Please try again.",
		parameterMissing: (args) => `Missing required parameter: ${args.parameter}`,
		invalidOperation: "Invalid operation attempted.",
		userNotFound: (args) => `User **${args.username}** not found.`,
		rsnNotBound: (args) => `**${args.rsn}** is not bound to a known member.`,
		fetchFailed: (args) => `Failed to fetch ${args.resource}.`,
		updateFailed: (args) => `Failed to update ${args.resource}.`,
		deleteFailed: (args) => `Failed to delete ${args.resource}.`,
		createFailed: (args) => `Failed to create ${args.resource}.`,
		womUnavailable: "Wise Old Man API is currently unavailable.",
		womPlayerNotFound: (args) =>
			`Player **${args.rsn}** not found on Wise Old Man.`,
		channelNotFound: "Required channel not found.",
		messageNotFound: "Message not found or has been deleted.",
		expiredRequest: "This request has expired. Please submit a new one.",
		unauthorized: "You are not authorized to perform this action.",
		guildNotInitialized:
			"This server has not been initialized. Please contact an administrator.",
	},

	success: {
		operationComplete: "Operation completed successfully.",
		dataUpdated: (args) => `${args.resource} updated successfully.`,
		dataCreated: (args) => `${args.resource} created successfully.`,
		dataDeleted: (args) => `${args.resource} deleted successfully.`,
		settingsSaved: "Settings saved successfully.",
		configurationUpdated: "Configuration updated successfully.",
		cacheCleared: "Cache cleared successfully.",
		backupCreated: "Backup created successfully.",
		maintenanceComplete: "Maintenance completed successfully.",
	},

	status: {
		online: "✅ Online",
		offline: "❌ Offline",
		maintenance: "🔧 Under Maintenance",
		degraded: "⚠️ Degraded Performance",
		checking: "🔄 Checking...",
		healthy: "System is healthy.",
		unhealthy: "System is experiencing issues.",
		apiStatus: (args) => `API Status: ${args.status}`,
		databaseStatus: (args) => `Database Status: ${args.status}`,
		botStatus: (args) => `Bot Status: ${args.status}`,
		uptime: (args) => `Uptime: ${args.uptime}`,
		lastRestart: (args) => `Last Restart: ${args.time}`,
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
