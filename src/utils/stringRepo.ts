/**
 * Define all the string categories and their keys
 */
export interface StringDefinitions {
    ranks: {
        levelUpMessage: (args: { username: string; icon: string; rankName: string }) => string;
        pointsGranted: (args: {
            username: string;
            pointsGiven: number;
            grantedBy: string;
            totalPoints: number
        }) => string;
    };
    competitions: {
        header: (args: { title: string }) => string;
        participantCount: (args: { count: number }) => string;
        eligibleCount: (args: { eligibleCount: number }) => string;
        pointsHeader: string;
    };
    accounts: {
        unlinkedHeader: string;
        unlinkedAccount: (args: { name: string; pointsGiven: number }) => string;
        unlinkInstructions: string;
        unlinkHelp: string;
    };
    errors: {
        noGuild: string;
        noMember: string;
        competitionError: string;
    };
}

/**
 * Extract categories from StringDefinitions
 */
export type StringCategory = keyof StringDefinitions;

/**
 * Extract keys for a specific category
 */
export type StringKey<C extends StringCategory> = keyof StringDefinitions[C];

/**
 * Extract argument type for a specific string template
 */
export type StringArgs<
    C extends StringCategory,
    K extends StringKey<C>
> = StringDefinitions[C][K] extends (args: infer A) => string ? A : never;

/**
 * Type guard to check if a string requires args
 */
export type RequiresArgs<
    C extends StringCategory,
    K extends StringKey<C>
> = StringDefinitions[C][K] extends (args: any) => string ? true : false;

/**
 * Implementation of the string repository
 */
const strings: {
    [C in StringCategory]: {
        [K in StringKey<C>]: StringDefinitions[C][K];
    };
} = {
    ranks: {
        levelUpMessage: (args) => `**${args.username}** ranked up to ${args.icon} ${args.rankName}!`,
        pointsGranted: (args) => `✔ **${args.username}** was granted ${args.pointsGiven} points by **${args.grantedBy}** and now has a total of ${args.totalPoints} points.`,
    },
    competitions: {
        header: (args) => `## ${args.title}`,
        participantCount: (args) => `Participants: ${args.count}`,
        eligibleCount: (args) => `Eligible for points: ${args.eligibleCount}`,
        pointsHeader: `\n## Points`,
    },
    accounts: {
        unlinkedHeader: `\n## Unlinked accounts`,
        unlinkedAccount: (args) => `**${args.name}** +${args.pointsGiven} points, once Discord linked to RSN`,
        unlinkInstructions: "\n_Once you link your rsn to the bot you'll be eligible to gain event points_",
        unlinkHelp: "_Please tag leadership to help with linking your account with your rsn_",
    },
    errors: {
        noGuild: "This command must be used in a guild.",
        noMember: "Couldn't retrieve member information.",
        competitionError: "Failed to retrieve competition data.",
    }
};

/**
 * Overloaded getString function to handle both types of strings (with and without args)
 */
export function getString<
    C extends StringCategory,
    K extends StringKey<C>
>(
    category: C,
    key: K,
    args: RequiresArgs<C, K> extends true ? StringArgs<C, K> : never
): string;

export function getString<
    C extends StringCategory,
    K extends StringKey<C>
>(
    category: C,
    key: K,
    args?: RequiresArgs<C, K> extends false ? never : StringArgs<C, K>
): string;

export function getString<
    C extends StringCategory,
    K extends StringKey<C>
>(
    category: C,
    key: K,
    args?: any
): string {
    if (!strings[category] || !(key in strings[category])) {
        console.warn(`String not found: ${String(category)}.${String(key)}`);
        return `[${String(category)}.${String(key)}]`;
    }

    const template = strings[category][key];

    if (typeof template === 'function') {
        if (!args) {
            console.warn(`Missing arguments for string template: ${String(category)}.${String(key)}`);
            return `[${String(category)}.${String(key)}:missing-args]`;
        }
        return template(args);
    } else {
        return template as string;
    }
}

/**
 * Typed version of getMultipleStrings
 */
export function getMultipleStrings<T extends Array<{
    category: StringCategory;
    key: StringKey<T[number]['category']>;
    args?: any;
}>>(
    stringRequests: T,
    separator: string = "\n"
): string {
    return stringRequests
        .map(request => {
            const { category, key, args } = request;
            return getString(category as any, key as any, args);
        })
        .join(separator);
}

export default { getString, getMultipleStrings };
