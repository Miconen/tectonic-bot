import { ApiErrorCode } from "@typings/api/codes";

export const apiErrorNames = Object.fromEntries(
	Object.entries(ApiErrorCode).map(([name, code]) => [code, name]),
) as Record<number, string>;
