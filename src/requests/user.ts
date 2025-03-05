import { ApiResponse, DetailedUser, PointsParam, RSN, Time, User, UserParam, UsersParam } from "@typings/requests";
import { fetchData } from "./main"

// Allows for creation of multiple convinience functions that return more specific data
function userParamHandler(query: UserParam | UsersParam) {
    const handleArray = (param: string | string[]) =>
        Array.isArray(param) ? param.join(",") : param;

    if (query.type === "wom") {
        return `wom/${handleArray(query.wom)}`;
    }
    if (query.type === "rsn") {
        return `rsn/${handleArray(query.rsn)}`;
    }
    return handleArray(query.user_id);
}

// Utility function to preserve the HTTP information while changing the inner data
function rewrapResponse<T, R>(res: ApiResponse<R>, field: T): ApiResponse<T> {
    if (res.error) return res
    return {
        error: res.error,
        status: res.status,
        data: field,
    }
}


export async function getFullUser(guild_id: string, query: UserParam) {
    const url = `guilds/${guild_id}/users/${userParamHandler(query)}`
    const user = await fetchData<DetailedUser>(url)

    return user
}

export async function getFullUsers(guild_id: string, query: UsersParam) {
    const url = `guilds/${guild_id}/users/${userParamHandler(query)}`
    const users = await fetchData<DetailedUser[]>(url)

    return users
}

export async function getUser(guild_id: string, query: UserParam) {
    const user = await getFullUser(guild_id, query)
    if (user.error) return user
    return rewrapResponse<User, DetailedUser>(user, user.data.user)
}

export async function getUsers(guild_id: string, query: UsersParam) {
    const users = await getFullUsers(guild_id, query)
    if (users.error) return users
    return rewrapResponse<User[], DetailedUser[]>(users, users.data.map(u => u.user))
}

export async function getUserPbs(guild_id: string, query: UserParam) {
    const user = await getFullUser(guild_id, query)
    if (user.error) return user
    return rewrapResponse<Time[], DetailedUser>(user, user.data.times)
}

export async function getUserPoints(guild_id: string, query: UserParam) {
    const user = await getUser(guild_id, query)
    if (user.error) return user
    return rewrapResponse<number, User>(user, user.data.points)
}

export async function getUsersRsns(guild_id: string, query: UsersParam) {
    const users = await getUsers(guild_id, query)
    if (users.error) return users
    return rewrapResponse<RSN[][], User[]>(users, users.data.map(u => u.rsns))
}

export async function getUserRsns(guild_id: string, query: UserParam) {
    const user = await getUser(guild_id, query)
    if (user.error) return user
    return rewrapResponse<RSN[], User>(user, user.data.rsns)
}

export async function createUser(guild_id: string, user_id: string, rsn: string) {
    const url = `guilds/${guild_id}/users/${user_id}`
    const options = {
        method: "POST",
        body: JSON.stringify({ rsn })
    }
    const status = await fetchData(url, options)

    return status
}

export async function removeUser(guild_id: string, query: UserParam) {
    const url = `guilds/${guild_id}/users/${userParamHandler(query)}`
    const options = { method: "DELETE" }
    const status = await fetchData(url, options)

    return status
}

export async function addRsn(guild_id: string, user_id: string, rsn: string) {
    const url = `guilds/${guild_id}/users/${user_id}/rsns`
    const options = {
        method: "POST",
        body: JSON.stringify({ rsn })
    }
    const status = await fetchData(url, options)

    return status
}

export async function removeRsn(guild_id: string, user_id: string, rsn: string) {
    const url = `guilds/${guild_id}/users/${user_id}/rsns/${rsn}`
    const options = { method: "DELETE" }
    const status = await fetchData(url, options)

    return status
}

export async function givePoints(guild_id: string, query: PointsParam) {
    const ids = Array.isArray(query.user_id) ? query.user_id : [query.user_id]
    let body: Object
    let url = `guilds/${guild_id}/points/`

    if (query.points.type === "custom") {
        url += `custom/${query.points.amount}`
        body = {
            guild_id,
            user_ids: ids,
            points: query.points.amount
        }
    } else {
        url += query.points.event
        body = {
            guild_id,
            user_ids: ids,
            event: query.points.event
        }
    }

    const options = { method: "PUT", body: JSON.stringify(body) }
    const status = await fetchData(url, options)

    return status
}
