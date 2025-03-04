namespace Requests {
    export const mockUser: DetailedUser = {
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

    export function getFullUser(guild_id: string, query: UserParam): DetailedUser {
        return mockUser
    }

    export function getFullUsers(guild_id: string, query: UserParam): DetailedUser[] {
        return [mockUser]
    }

    export function getUser(guild_id: string, query: UserParam): User {
        return mockUser.user
    }

    export function getUsers(guild_id: string, query: UserParam): User[] {
        return [mockUser.user]
    }

    export function getUserPbs(guild_id: string, query: UserParam): Time[] {
        return mockUser.times
    }

    export function getUserPoints(guild_id: string, query: UserParam): number {
        return mockUser.user.points
    }

    export function getUsersRsns(guild_id: string, query: UserParam) {
        return mockUser.user.rsns
    }

    export function getUserRsns(guild_id: string, query: UserParam) {
        return mockUser.user.rsns
    }

    export function createUser(guild_id: string, user_id: string, rsn: string) {
        return 200
    }

    export function removeUser(guild_id: string, user_id: string) {
        return 200
    }

    export function addRsn(guild_id: string, user_id: string, rsn: string, wom: string) {
        return 200
    }

    export function removeRsn(guild_id: string, user_id: string, rsn: string) {
        return 200
    }

    export function givePoints(guild_id: string, query: PointsParam) {
        return 200
    }
}
