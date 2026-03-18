const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos

interface CacheEntry {
  darkreadUrl: string;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export function getCached(articleUrl: string): string | null {
  const entry = cache.get(articleUrl);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(articleUrl);
    return null;
  }
  return entry.darkreadUrl;
}

export function setCached(articleUrl: string, darkreadUrl: string): void {
  cache.set(articleUrl, { darkreadUrl, expiresAt: Date.now() + CACHE_TTL_MS });
}
