import * as User from "@requests/user";
import * as Guild from "@requests/guild";
import * as General from "@requests/general";
import * as Wom from "@requests/wom";
import { HTTPError } from "discord.js";
import type { ApiErrorBody, ApiResponse } from "@typings/requests";

const API_URL = process.env.API_URL
	? `https://${process.env.API_URL}/api/v1/`
	: "http://localhost:8080/api/v1/";
const AUTH_KEY = process.env.AUTH_KEY ?? "";

if (!AUTH_KEY) {
	throw new Error("No AUTH_KEY found.");
}

// Standard variation
export async function fetchData<T>(
	endpoint: string,
	options: RequestInit = {},
	url: string = API_URL,
): Promise<ApiResponse<T>> {
	options.headers = {
		...options.headers,
		Authorization: AUTH_KEY,
		"Content-Type": "application/json",
	};

	try {
		// console.log(`Fetching (${options.method ?? "GET"})`, url + endpoint);
		const response = await fetch(url + endpoint, options);

		// Check if the response is ok (status code 200-299)
		if (!response.ok) {
			const body = (await response.json()) as ApiErrorBody;

			return {
				error: true,
				status: response.status,
				code: body.code,
				name: body.name,
				message: body.message,
			};
		}

		// console.log(`Success: ${response.status}`);

		let data = {} as T;

		// Hack to avoid parsing an empty body
		if (response.status !== 204) {
			// Parse the JSON response if it's successful
			data = (await response.json()) as T;
		}

		return { error: false, status: response.status, data };
	} catch (error) {
		// Handle errors that occur during the fetch request
		console.log(error);
		return {
			error: true,
			status: error instanceof HTTPError ? error.status : 500,
			code: -1,
			name: "Unknown error",
			message: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export const Requests = { ...User, ...Guild, ...General, ...Wom };
