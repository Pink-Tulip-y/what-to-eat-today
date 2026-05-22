// 简单的内存 TTL 缓存

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const store = new Map<string, CacheEntry<any>>();

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

export function cacheSet<T>(key: string, data: T, ttlMs = 10 * 60 * 1000): void {
  store.set(key, { data, expiry: Date.now() + ttlMs });
  // 最多保留 500 条
  if (store.size > 500) {
    const first = store.keys().next().value;
    if (first) store.delete(first);
  }
}
