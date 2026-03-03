import { Request, Response, NextFunction } from 'express';

// ── Types ──

interface CounterMetric {
  type: 'counter';
  value: number;
}

interface GaugeMetric {
  type: 'gauge';
  value: number;
}

interface HistogramMetric {
  type: 'histogram';
  values: number[];
  count: number;
  sum: number;
  min: number;
  max: number;
}

type MetricEntry = CounterMetric | GaugeMetric | HistogramMetric;

interface HistogramSummary {
  type: 'histogram';
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  p95: number;
  p99: number;
}

type MetricSnapshot = {
  type: 'counter';
  value: number;
} | {
  type: 'gauge';
  value: number;
} | HistogramSummary;

// ── Metrics Class ──

export class Metrics {
  private metrics: Map<string, MetricEntry> = new Map();

  /**
   * Increment a counter by the given value (default: 1).
   */
  increment(name: string, value: number = 1): void {
    const existing = this.metrics.get(name);
    if (existing && existing.type === 'counter') {
      existing.value += value;
    } else {
      this.metrics.set(name, { type: 'counter', value });
    }
  }

  /**
   * Set a gauge to an absolute value.
   */
  gauge(name: string, value: number): void {
    this.metrics.set(name, { type: 'gauge', value });
  }

  /**
   * Record a value in a histogram for statistical analysis.
   */
  histogram(name: string, value: number): void {
    const existing = this.metrics.get(name);
    if (existing && existing.type === 'histogram') {
      existing.values.push(value);
      existing.count++;
      existing.sum += value;
      existing.min = Math.min(existing.min, value);
      existing.max = Math.max(existing.max, value);
    } else {
      this.metrics.set(name, {
        type: 'histogram',
        values: [value],
        count: 1,
        sum: value,
        min: value,
        max: value,
      });
    }
  }

  /**
   * Measure the execution time of an async function and record it as a histogram value.
   */
  async timing<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      return result;
    } finally {
      const duration = performance.now() - start;
      this.histogram(name, duration);
    }
  }

  /**
   * Get a snapshot of all collected metrics.
   */
  getMetrics(): Record<string, MetricSnapshot> {
    const result: Record<string, MetricSnapshot> = {};

    for (const [name, metric] of this.metrics) {
      if (metric.type === 'counter') {
        result[name] = { type: 'counter', value: metric.value };
      } else if (metric.type === 'gauge') {
        result[name] = { type: 'gauge', value: metric.value };
      } else if (metric.type === 'histogram') {
        const sorted = [...metric.values].sort((a, b) => a - b);
        const count = sorted.length;

        result[name] = {
          type: 'histogram',
          count: metric.count,
          sum: metric.sum,
          min: metric.min,
          max: metric.max,
          avg: count > 0 ? metric.sum / count : 0,
          p95: count > 0 ? sorted[Math.floor(count * 0.95)] ?? sorted[count - 1]! : 0,
          p99: count > 0 ? sorted[Math.floor(count * 0.99)] ?? sorted[count - 1]! : 0,
        };
      }
    }

    return result;
  }

  /**
   * Get a single metric by name, or undefined if it does not exist.
   */
  getMetric(name: string): MetricSnapshot | undefined {
    const metric = this.metrics.get(name);
    if (!metric) return undefined;

    const all = this.getMetrics();
    return all[name];
  }

  /**
   * Clear all collected metrics.
   */
  reset(): void {
    this.metrics.clear();
  }
}

// ── Singleton Instance ──

export const metrics = new Metrics();

// ── Pre-defined Metric Names ──

export const MetricNames = {
  HTTP_REQUESTS_TOTAL: 'http_requests_total',
  HTTP_REQUEST_DURATION: 'http_request_duration',
  ACTIVE_CONNECTIONS: 'active_connections',
  ERRORS_TOTAL: 'errors_total',
} as const;

// ── Express Middleware ──

/**
 * Express middleware that automatically tracks HTTP request count and duration.
 *
 * Metrics recorded:
 * - http_requests_total (counter): incremented for every request
 * - http_request_duration (histogram): request duration in milliseconds
 * - active_connections (gauge): number of currently in-flight requests
 * - errors_total (counter): incremented for responses with status >= 500
 */
export function metricsMiddleware() {
  let activeConnections = 0;

  return (req: Request, res: Response, next: NextFunction): void => {
    const start = performance.now();

    activeConnections++;
    metrics.gauge(MetricNames.ACTIVE_CONNECTIONS, activeConnections);

    // Track when response finishes
    res.on('finish', () => {
      const duration = performance.now() - start;

      activeConnections--;
      metrics.gauge(MetricNames.ACTIVE_CONNECTIONS, activeConnections);

      metrics.increment(MetricNames.HTTP_REQUESTS_TOTAL);
      metrics.histogram(MetricNames.HTTP_REQUEST_DURATION, duration);

      // Track specific route and method
      const route = req.route?.path ?? req.path;
      const method = req.method;
      metrics.increment(`http_requests.${method}.${route}`);
      metrics.histogram(`http_request_duration.${method}.${route}`, duration);

      // Track errors
      if (res.statusCode >= 500) {
        metrics.increment(MetricNames.ERRORS_TOTAL);
      }
    });

    next();
  };
}

/**
 * Express route handler that exposes collected metrics as JSON.
 * Mount at GET /metrics.
 */
export function metricsHandler(_req: Request, res: Response): void {
  res.json({
    timestamp: new Date().toISOString(),
    metrics: metrics.getMetrics(),
  });
}
