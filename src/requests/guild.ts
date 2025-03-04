const mockUser: DetailedUser = {
    "user": {
        "user_id": "...",
        "guild_id": "...",
        "points": 120,
        "rsns": [
            {
                "rsn": "...",
                "wom_id": "..."
            },
            {
                "rsn": "...",
                "wom_id": "..."
            }
        ]
    },
    "times": [
        {
            "time": 69,
            "boss_category": "...",
            "boss_name": "...",
            "run_id": 420,
            "date": "...",
            "team": [
                {
                    "user_id": "...",
                    "guild_id": "...",
                    "points": 0,
                    "rsns": [
                        {
                            "rsn": "...",
                            "wom_id": "..."
                        },
                        {
                            "rsn": "...",
                            "wom_id": "..."
                        }
                    ]
                },
                {
                    "user_id": "...",
                    "guild_id": "...",
                    "points": 0,
                    "rsns": [
                        {
                            "rsn": "...",
                            "wom_id": "..."
                        },
                        {
                            "rsn": "...",
                            "wom_id": "..."
                        }
                    ]
                }
            ]
        }
    ]
}

type Boss = {
    category: string;
    name: string;
    display_name: string;
};

const bosses: Boss[] = [
    // Chambers of Xeric
    { category: 'Chambers of Xeric', name: 'cox_1', display_name: 'Solo' },
    { category: 'Chambers of Xeric', name: 'cox_2', display_name: 'Duo' },
    { category: 'Chambers of Xeric', name: 'cox_3', display_name: 'Trio' },
    { category: 'Chambers of Xeric', name: 'cox_5', display_name: '5-man' },
    { category: 'Chambers of Xeric', name: 'cox_any', display_name: 'Any' },

    // Chambers of Xeric: CM
    { category: 'Chambers of Xeric: CM', name: 'cm_1', display_name: 'Solo' },
    { category: 'Chambers of Xeric: CM', name: 'cm_2', display_name: 'Duo' },
    { category: 'Chambers of Xeric: CM', name: 'cm_3', display_name: 'Trio' },
    { category: 'Chambers of Xeric: CM', name: 'cm_5', display_name: '5-man' },
    { category: 'Chambers of Xeric: CM', name: 'cm_any', display_name: 'Any' },

    // Theatre of Blood
    { category: 'Theatre of Blood', name: 'tob_1', display_name: 'Solo' },
    { category: 'Theatre of Blood', name: 'tob_2', display_name: 'Duo' },
    { category: 'Theatre of Blood', name: 'tob_3', display_name: 'Trio' },
    { category: 'Theatre of Blood', name: 'tob_4', display_name: '4-man' },
    { category: 'Theatre of Blood', name: 'tob_5', display_name: '5-man' },

    // Theatre of Blood: HM
    { category: 'Theatre of Blood: HM', name: 'hmt_1', display_name: 'Solo' },
    { category: 'Theatre of Blood: HM', name: 'hmt_2', display_name: 'Duo' },
    { category: 'Theatre of Blood: HM', name: 'hmt_3', display_name: 'Trio' },
    { category: 'Theatre of Blood: HM', name: 'hmt_4', display_name: '4-man' },
    { category: 'Theatre of Blood: HM', name: 'hmt_5', display_name: '5-man' },

    // Tombs of Amascut
    { category: 'Tombs of Amascut', name: 'toa_solo_150', display_name: 'Solo 150+' },
    { category: 'Tombs of Amascut', name: 'toa_solo_300', display_name: 'Solo 300+' },
    { category: 'Tombs of Amascut', name: 'toa_solo_400', display_name: 'Solo 400+' },
    { category: 'Tombs of Amascut', name: 'toa_solo_500', display_name: 'Solo 500+' },
    { category: 'Tombs of Amascut', name: 'toa_team_150', display_name: 'Team 150+' },
    { category: 'Tombs of Amascut', name: 'toa_team_300', display_name: 'Team 300+' },
    { category: 'Tombs of Amascut', name: 'toa_team_400', display_name: 'Team 400+' },
    { category: 'Tombs of Amascut', name: 'toa_team_500', display_name: 'Team 500+' },

    // Miscellaneous
    { category: 'Miscellaneous', name: 'vorkath', display_name: 'Vorkath' },
    { category: 'Miscellaneous', name: 'muspah', display_name: 'Phantom Muspah' },
    { category: 'Miscellaneous', name: 'mimic', display_name: 'Mimic' },
    { category: 'Miscellaneous', name: 'hespori', display_name: 'Hespori' },
    { category: 'Miscellaneous', name: 'zulrah', display_name: 'Zulrah' },
    { category: 'Miscellaneous', name: 'gauntlet', display_name: 'Gauntlet' },
    { category: 'Miscellaneous', name: 'corrupted_gauntlet', display_name: 'Corrupted Gauntlet' },

    // Slayer Boss
    { category: 'Slayer Boss', name: 'hydra', display_name: 'Alchemical Hydra' },
    { category: 'Slayer Boss', name: 'ggs', display_name: 'Grotesque Guardians' },

    // Nightmare
    { category: 'Nightmare', name: 'nm_1', display_name: 'Solo' },
    { category: 'Nightmare', name: 'nm_5', display_name: '5-man' },
    { category: 'Nightmare', name: 'pnm', display_name: 'Phosani\'s Nightmare' },

    // Sepulchre
    { category: 'Sepulchre', name: 'sep_5', display_name: 'Sepulchre Floor 5' },
    { category: 'Sepulchre', name: 'sep', display_name: 'Sepulchre Overall' },

    // TzHaar
    { category: 'TzHaar', name: 'inferno', display_name: 'Inferno' },
    { category: 'TzHaar', name: 'fight_caves', display_name: 'Fight Caves' },

    // Desert Treasure II
    { category: 'Desert Treasure II', name: 'vardorvis', display_name: 'Vardorvis' },
    { category: 'Desert Treasure II', name: 'leviathan', display_name: 'Leviathan' },
    { category: 'Desert Treasure II', name: 'duke_sucellus', display_name: 'Duke Sucellus' },
    { category: 'Desert Treasure II', name: 'whisperer', display_name: 'The Whisperer' },
    { category: 'Desert Treasure II', name: 'awakened_vardorvis', display_name: 'Vardorvis (Awakened)' },
    { category: 'Desert Treasure II', name: 'awakened_leviathan', display_name: 'Leviathan (Awakened)' },
    { category: 'Desert Treasure II', name: 'awakened_duke_sucellus', display_name: 'Duke Sucellus (Awakened)' },
    { category: 'Desert Treasure II', name: 'awakened_whisperer', display_name: 'The Whisperer (Awakened)' },

    // Varlamore
    { category: 'Varlamore', name: 'colosseum', display_name: 'Fortis Colosseum' }
];


const mockGuild: Guild = {
    "guild_id": "123",
    "multiplier": 1,
    "pb_channel_id": "123",
}

export function getLeaderboard(guild_id: string) {
    return [mockUser]
}

export function getGuild(guild_id: string): Guild {
    return mockGuild
}

export function updateGuild(guild_id: string, query: GuildUpdate) {
    return true
}

// TODO: Consider returning the old pb if time was beat
export function newTime(guild_id: string, time: NewTime) {
    return true
}

export function getBosses() {
    return bosses
}
