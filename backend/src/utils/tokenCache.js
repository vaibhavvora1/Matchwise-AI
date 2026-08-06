/**
 * In-memory Token Cache implementing standard Map with TTL expiration.
 * Mimics the Redis Client API used in auth controllers and tests.
 * 
 * Tradeoff Note: This in-memory cache will NOT persist across server restarts
 * or scale across multiple server instances (e.g. multi-instance deployments).
 * However, it is free, requires no external services, and is perfectly suitable
 * for the current single-instance deployment on Render.
 */
class TokenCache {
  constructor() {
    this.store = new Map();
  }

  async get(key) {
    const item = this.store.get(key);
    if (!item) return null;

    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key, value, options) {
    let expiresAt = null;
    if (options && options.EX) {
      expiresAt = Date.now() + options.EX * 1000;
    }
    this.store.set(key, { value: String(value), expiresAt });
    return "OK";
  }

  async del(key) {
    if (Array.isArray(key)) {
      let count = 0;
      key.forEach((k) => {
        if (this.store.delete(k)) count++;
      });
      return count;
    }
    return this.store.delete(key) ? 1 : 0;
  }

  async scan(cursor, options) {
    const match = options?.MATCH;
    if (!match) {
      return { cursor: 0, keys: Array.from(this.store.keys()) };
    }

    const regexStr = "^" + match.replace(/\*/g, ".*") + "$";
    const regex = new RegExp(regexStr);

    const matchingKeys = Array.from(this.store.keys()).filter((key) => {
      const item = this.store.get(key);
      if (item && item.expiresAt && Date.now() > item.expiresAt) {
        this.store.delete(key);
        return false;
      }
      return regex.test(key);
    });

    return { cursor: 0, keys: matchingKeys };
  }
}

const tokenCache = new TokenCache();
export default tokenCache;
