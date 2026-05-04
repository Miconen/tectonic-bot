export class TTLCache<T> {
  private cache = new Map<string, T>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  private ttl: number | null;

  constructor(ttlMs: number | null = 30 * 1000) {
    this.ttl = ttlMs; // null = never expire
  }

  get(key: string): T | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: T): void {
    // Clear reset timeout for key
    const existing = this.timers.get(key);
    if (existing !== undefined) {
      clearTimeout(existing);
    }

    this.cache.set(key, value);

    if (this.ttl === null) return;

    const timer = setTimeout(() => {
      this.invalidate(key);
    }, this.ttl);
    this.timers.set(key, timer);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): boolean {
    const timer = this.timers.get(key);
    if (!timer) return this.cache.delete(key);
    clearTimeout(timer);
    return this.timers.delete(key);
  }

  [Symbol.iterator](): IterableIterator<[string, T]> {
    return this.cache[Symbol.iterator]();
  }

  toArray(): T[] {
    return Array.from(this.cache.values());
  }

  private invalidate(key: string) {
    this.cache.delete(key);
    this.timers.delete(key);
  }
}
