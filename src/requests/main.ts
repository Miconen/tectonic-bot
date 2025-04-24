import * as User from "@requests/user";
import * as Guild from "@requests/guild";
import * as General from "@requests/general";
import * as Wom from "@requests/wom";
import { HTTPError } from "discord.js";
import type { ApiErrorBody, ApiResponse } from "@typings/requests";
import { pino } from "pino";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

const API_URL = process.env.API_URL
	? `https://${process.env.API_URL}/api/v1/`
	: "http://localhost:8080/api/v1/";
const AUTH_KEY = process.env.AUTH_KEY ?? "";

if (!AUTH_KEY) {
	throw new Error("No AUTH_KEY found.");
}

// API fetching and parsing utility
export async function fetchData<T>(
	endpoint: string,
	options: RequestInit = {},
	url: string = API_URL,
): Promise<ApiResponse<T>> {
	const requestOptions: RequestInit = {
		...options,
		headers: {
			"Content-Type": "application/json",
			Authorization: AUTH_KEY,
			...options.headers,
		},
	};

	const fullUrl = url + endpoint;

	logger.info(
		{
			endpoint: fullUrl,
			method: requestOptions.method ?? "GET",
			body: requestOptions.body,
		},
		"Pre-fetch request details",
	);

	try {
		const response = await fetch(fullUrl, requestOptions);
		const status = response.status;

		// Handle 204 No Content responses without parsing the body
		if (status === 204) {
			const successResponse: ApiResponse<T> = {
				error: false,
				status,
				data: {} as T,
			};

			logger.info({ code: status }, "Request success code");
			logger.debug({ response: successResponse }, "Request response");
			return successResponse;
		}

		// Check Content-Type for non-204 responses
		const contentType = response.headers.get("Content-Type");
		if (!contentType?.includes("application/json")) {
			const error: ApiResponse<T> = {
				error: true,
				status,
				code: -1,
				name: "Unsupported Content-Type",
				message: `Unsupported Content-Type header "${contentType}" from endpoint "${fullUrl}"`,
			};

			logger.error(error, "Request error");
			logger.debug({ response: error }, "Request response");
			return error;
		}

		// Parse JSON response
		let data: unknown;
		try {
			data = await response.json();
		} catch (e) {
			const error: ApiResponse<T> = {
				error: true,
				status,
				code: -1,
				name: "JSON Parse Error",
				message:
					e instanceof Error ? e.message : "Failed to parse JSON response",
			};

			logger.error(error, "Request error");
			logger.debug({ response: error }, "Request response");
			return error;
		}

		// Handle non-successful status codes
		if (!response.ok) {
			const errorBody = data as ApiErrorBody;
			const error: ApiResponse<T> = {
				error: true,
				status,
				code: errorBody.code,
				name: errorBody.name,
				message: errorBody.message,
			};

			logger.error(error, "Request error");
			logger.debug({ response: error }, "Request response");
			return error;
		}

		// Success case
		const successResponse: ApiResponse<T> = {
			error: false,
			status,
			data: data as T,
		};

		logger.info({ code: status }, "Request success code");
		logger.debug({ response: successResponse }, "Request response");

		return successResponse;
	} catch (error) {
		// Handle network or other fetch errors
		const errorResponse: ApiResponse<T> = {
			error: true,
			status: error instanceof HTTPError ? error.status : 500,
			code: -1,
			name: "Network Error",
			message: error instanceof Error ? error.message : "Unknown network error",
		};

		logger.error(errorResponse, "Request error");
		logger.debug({ response: errorResponse }, "Request response");
		return errorResponse;
	}
}

export const Requests = { ...User, ...Guild, ...General, ...Wom };
