export class TTLCache<T> {
	private cache = new Map<string, T>();
	private ttl: number | null;

	constructor(ttlMs: number | null = 30 * 1000) {
		this.ttl = ttlMs; // null = never expire
	}

	get(key: string): T | undefined {
		return this.cache.get(key);
	}

	set(key: string, value: T): void {
		this.cache.set(key, value);
		if (this.ttl !== null) {
			setTimeout(() => this.cache.delete(key), this.ttl);
		}
	}

	has(key: string): boolean {
		return this.cache.has(key);
	}

	delete(key: string): boolean {
		return this.cache.delete(key);
	}

	[Symbol.iterator](): IterableIterator<[string, T]> {
		return this.cache[Symbol.iterator]();
	}

	toArray(): T[] {
		return Array.from(this.cache.values());
	}
}
