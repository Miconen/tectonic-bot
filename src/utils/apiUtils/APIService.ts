/* async function fetch<T>(url: string, options: unknown): Promise<T> {
    let response: Response | null = null;
    try {
        response = await window.fetch(url, options);
        const data = await response.json();
        return data as T;
    } catch (error) {
        console.error(error);
        throw error;
        // TODO: Implement error handling
    }
} */
