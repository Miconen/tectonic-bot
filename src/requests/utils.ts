import type { ApiResponse } from "@typings/requests";

// Utility function to preserve the HTTP information while changing the inner data
export function rewrapResponse<T, R>(
	res: ApiResponse<R>,
	field: T,
): ApiResponse<T> {
	if (res.error) return res;
	return {
		error: res.error,
		status: res.status,
		data: field,
	};
}
