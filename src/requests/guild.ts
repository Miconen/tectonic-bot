namespace Requests {
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
}
