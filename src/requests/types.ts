type ApiResponse<T> = {
    status: number,
    body: T,
}

type RSN = {
    rsn: string,
    wom_id: string,
}

type User = {
    user_id: string,
    guild_id: string,
    points: number,
    rsns: RSN[],
}

type Time = {
    time: number,
    boss_category: string,
    boss_name: string,
    run_id: number,
    date: string,
    team: User[],
}

type NewTime = {
    user_ids: string[],
    time: number,
    boss_name: string,
}

type DetailedUser = {
    user: User,
    times: Time[],
}

type Leaderboard = {
    users: DetailedUser[],
}

type Guild = {
    guild_id: string,
    multiplier: number,
    pb_channel_id: string
}

// UserParam with Discriminated Union
type UserById = {
    type: "user_id";
    user_id: string | string[];
};

type UserByWom = {
    type: "wom";
    wom: string | string[];
};

type UserByRsn = {
    type: "rsn";
    rsn: string | string[];
};

type UserParam = UserById | UserByWom | UserByRsn;

type Points = number | 'event_participation' | 'event_hosting' | 'clan_pb' | 'split_low' | 'split_medium' | 'split_high';

// PointsParam with Discriminated Union
type PointsById = {
    type: "user_id";
    user_id: string | string[];
    points: Points;
};

type PointsByRsn = {
    type: "rsn";
    rsn: string | string[];
    points: Points;
};

type PointsParam = PointsById | PointsByRsn;

type UpdateMultiplier = {
    type: "multiplier";
    multiplier: number;
}

type UpdatePbChannel = {
    type: "pb_channel"
    pb_channel: string;
}

type GuildUpdate = UpdateMultiplier | UpdatePbChannel;
