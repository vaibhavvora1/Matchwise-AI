/**
 * Lightweight TTL-based Cache for API responses (JSearch queries & Gemini criteria extractions).
 * Reduces duplicate external API network calls and quota consumption.
 */
class SimpleTTLCache {
  constructor(defaultTtlMs = 1000 * 60 * 60) {
    this.store = new Map();
    this.defaultTtlMs = defaultTtlMs;
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value, ttlMs = this.defaultTtlMs) {
    const expiresAt = Date.now() + ttlMs;
    // Bound memory size — max 500 keys
    if (this.store.size >= 500) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }
    this.store.set(key, { value, expiresAt });
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

// JSearch queries cached for 1 hour
export const jsearchCache = new SimpleTTLCache(1000 * 60 * 60);

// Gemini resume criteria extractions cached for 6 hours
export const geminiCriteriaCache = new SimpleTTLCache(1000 * 60 * 60 * 6);
