import * as User from "@requests/user"
import * as Guild from "@requests/guild"
import { HTTPError } from "discord.js";
import { ApiResponse } from "typings/requests";

const API_URL = (`https://${process.env.API_URL}` ?? "http://localhost:8080") + "/api/v1/"
const AUTH_KEY = process.env.AUTH_KEY ?? ""

if (!AUTH_KEY) {
    throw new Error("No AUTH_KEY found.")
}

// Standard variation
export async function fetchData<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {

    options.headers = {
        ...options.headers,
        "Authorization": AUTH_KEY,
        "Content-Type": "application/json",
    }

    try {
        console.log(`Fetching (${options.method ?? "GET"})`, API_URL + url)
        const response = await fetch(API_URL + url, options);

        // Check if the response is ok (status code 200-299)
        if (!response.ok) {
            // Handle non-2xx responses
            const error = `Error: ${response.statusText} (${response.status})`;
            console.log(error)
            return { error: true, status: response.status, message: error };
        }

        console.log(`Success: ${response.status}`)

        let data = {} as T
        // Hack to avoid parsing an empty body
        if (response.status !== 204) {
            // Parse the JSON response if it's successful
            data = (await response.json()) as T;
        }


        return { error: false, status: response.status, data };
    } catch (error) {
        // Handle errors that occur during the fetch request
        console.log(error)
        return { error: true, status: (error instanceof HTTPError ? error.status : 500), message: (error instanceof Error ? error.message : 'Unknown error') };
    }
}

export const Requests = { ...User, ...Guild }
