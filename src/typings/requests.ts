export type SuccessResponse<T> = {
    error: false;
    status: number;
    data: T;
};

export type ErrorResponse = {
    error: true;
    status: number;
    message: string;
};

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export type RSN = {
    rsn: string,
    wom_id: string,
}

export type User = {
    user_id: string,
    guild_id: string,
    points: number,
    rsns: RSN[],
}

export type SimpleUser = Omit<User, "rsns">

export type Time = {
    time: number,
    boss_name: string,
    display_name: string,
    category: string,
    run_id: number,
    date: string,
    team: User[],
}

export type NewTime = {
    user_ids: string[],
    time: number,
    boss_name: string,
}

export type TimeResponse = {
    boss_name: string,
    time: number,
    time_old: number,
    run_id: number,
}

export type DetailedUser = User & { times: Time[] }

export type Guild = {
    guild_id: string,
    multiplier: number,
    pb_channel_id: string
}

export type UserById = {
    type: "user_id";
    user_id: string;
};

export type UserByWom = {
    type: "wom";
    wom: string;
};

export type UserByRsn = {
    type: "rsn";
    rsn: string;
};

export type UserParam = UserById | UserByWom | UserByRsn;

export type UsersById = {
    type: "user_id";
    user_id: string[];
};

export type UsersByWom = {
    type: "wom";
    wom: string[];
};

export type UsersByRsn = {
    type: "rsn";
    rsn: string[];
};

export type UsersParam = UsersById | UsersByWom | UsersByRsn;

export type CustomPoints = {
    type: "custom";
    amount: number;
}

export type PresetPoints = {
    type: "preset";
    event: 'event_participation' | 'event_hosting' | 'clan_pb' | 'split_low' | 'split_medium' | 'split_high';
}

export type Points = CustomPoints | PresetPoints;

export type PointsParam = {
    user_id: string | string[];
    points: Points;
};

export type GuildUpdate = {
    pb_channel?: string;
    multiplier?: number;
}
