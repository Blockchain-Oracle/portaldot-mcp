type Entry<T> = { value: T; expires: number };

/**
 * Wrap an async read-only function with a small TTL cache. Used for chain reads
 * (balance, block info) — finality is ~6s so a short TTL avoids hammering the node.
 */
export function withCache<Args extends unknown[], T>(
  fn: (...args: Args) => Promise<T>,
  ttlMs = 5_000,
  keyFn: (...args: Args) => string = (...a) => JSON.stringify(a),
): (...args: Args) => Promise<T> {
  const store = new Map<string, Entry<T>>();
  return async (...args: Args): Promise<T> => {
    const key = keyFn(...args);
    const now = Date.now();
    const hit = store.get(key);
    if (hit && hit.expires > now) return hit.value;
    const value = await fn(...args);
    store.set(key, { value, expires: now + ttlMs });
    return value;
  };
}
