class RequestCache {
  private cache = new Map<string, Promise<unknown>>();

  public async getOrCreate<T>(
    key: string,
    requestFn: () => Promise<T>,
    ttl: number = 5000,
  ): Promise<T> {
    if (this.cache.has(key)) {
      return this.cache.get(key) as Promise<T>;
    }

    const promise = requestFn()
      .then((result) => {
        setTimeout(() => {
          this.cache.delete(key);
        }, ttl);
        return result;
      })
      .catch((error) => {
        this.cache.delete(key);
        throw error;
      });

    this.cache.set(key, promise);
    return promise;
  }

  public clear(): void {
    this.cache.clear();
  }

  public clearRequest(key: string): void {
    this.cache.delete(key);
  }
}

export const requestCache = new RequestCache();
