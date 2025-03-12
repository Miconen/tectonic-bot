type HandlerError = {
	error: true;
	message: string;
};

type HandlerOkay = {
	error: false;
};

type HandlerResponse = HandlerError | HandlerOkay;

// Handle common HTTP error responses in one place instead of individually
export function httpErrorHandler(status: number): HandlerResponse {
	if (status === 401) {
		return { error: true, message: `Internal authorization error.` };
	}

	if (status === 429) {
		return {
			error: true,
			message: `Too many requests, try again in a minute.`,
		};
	}

	if (status === 400) {
		return { error: true, message: "Internal error :(" };
	}

	if (status === 500) {
		return { error: true, message: "External error :(" };
	}

	return { error: false };
}
