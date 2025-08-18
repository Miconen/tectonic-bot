// Generic time to live cache implementation
export class TTLCache<T> {
	private cache = new Map<string, T>();
	private ttl: number;

	constructor(ttlMs: number = 30 * 1000) {
		this.ttl = ttlMs;
	}

	get(key: string): T | undefined {
		return this.cache.get(key);
	}

	set(key: string, value: T): void {
		this.cache.set(key, value);
		setTimeout(() => this.cache.delete(key), this.ttl);
	}

	has(key: string): boolean {
		return this.cache.has(key);
	}

	delete(key: string): boolean {
		return this.cache.delete(key);
	}
}
