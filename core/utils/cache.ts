/**
 * Cache in-memory simples com TTL
 * Para produção, considere usar Redis
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class Cache {
  private store: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTTL: number;

  constructor(defaultTTL: number = 300000) {
    this.defaultTTL = defaultTTL;
  }

  /**
   * Armazena um valor no cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.store.set(key, { data: value, expiresAt });
  }

  /**
   * Obtém um valor do cache
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Remove um valor do cache
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Remove entradas expiradas
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Verifica se uma chave existe e não está expirada
   */
  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Obtém ou calcula um valor (padrão cache-aside)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetcher();
    this.set(key, value, ttl);
    return value;
  }
}

export const cache = new Cache(
  parseInt(process.env.CACHE_TTL_MS || "300000", 10)
);

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    cache.cleanup();
  }, 600000);
}
