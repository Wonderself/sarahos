export interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
}

interface WindowEntry {
  timestamps: number[];
}

export class RateLimiter {
  private readonly windows = new Map<string, WindowEntry>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(options: RateLimiterOptions) {
    this.maxRequests = options.maxRequests;
    this.windowMs = options.windowMs;
  }

  canProceed(key: string): boolean {
    this.cleanup(key);
    const entry = this.windows.get(key);
    return !entry || entry.timestamps.length < this.maxRequests;
  }

  record(key: string): boolean {
    if (!this.canProceed(key)) {
      return false;
    }

    let entry = this.windows.get(key);
    if (!entry) {
      entry = { timestamps: [] };
      this.windows.set(key, entry);
    }

    entry.timestamps.push(Date.now());
    return true;
  }

  getRemainingRequests(key: string): number {
    this.cleanup(key);
    const entry = this.windows.get(key);
    return this.maxRequests - (entry?.timestamps.length ?? 0);
  }

  getResetTime(key: string): number {
    const entry = this.windows.get(key);
    if (!entry || entry.timestamps.length === 0) {
      return 0;
    }
    const oldest = entry.timestamps[0];
    return oldest !== undefined ? oldest + this.windowMs - Date.now() : 0;
  }

  private cleanup(key: string): void {
    const entry = this.windows.get(key);
    if (!entry) return;

    const cutoff = Date.now() - this.windowMs;
    entry.timestamps = entry.timestamps.filter((ts) => ts > cutoff);

    if (entry.timestamps.length === 0) {
      this.windows.delete(key);
    }
  }
}
