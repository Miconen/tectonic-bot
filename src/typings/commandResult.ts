// Create a discriminating union which narrows the type for better errors
// Discriminating unions: https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#discriminating-unions
type ResultSuccess<T> = { success: true; value: T };
type ResultError<E> = { success: false; error: E };
export type Result<T, E> = ResultSuccess<T> | ResultError<E>;
