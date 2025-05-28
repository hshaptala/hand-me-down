// Simple request deduplication cache
class RequestCache {
  private cache = new Map<string, Promise<unknown>>();

  // Get or create a cached request
  public async getOrCreate<T>(
    key: string,
    requestFn: () => Promise<T>,
    ttl: number = 5000, // 5 seconds default TTL
  ): Promise<T> {
    // Check if request is already in flight
    if (this.cache.has(key)) {
      return this.cache.get(key) as Promise<T>;
    }

    // Create new request and cache it
    const promise = requestFn()
      .then((result) => {
        // Remove from cache after TTL
        setTimeout(() => {
          this.cache.delete(key);
        }, ttl);
        return result;
      })
      .catch((error) => {
        // Remove from cache on error
        this.cache.delete(key);
        throw error;
      });

    this.cache.set(key, promise);
    return promise;
  }

  // Clear all cached requests
  public clear(): void {
    this.cache.clear();
  }

  // Clear specific request
  public clearRequest(key: string): void {
    this.cache.delete(key);
  }
}

// Global request cache instance
export const requestCache = new RequestCache();
