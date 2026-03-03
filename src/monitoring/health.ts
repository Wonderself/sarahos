import { Pool } from 'pg';
import os from 'os';
import fs from 'fs';
import { Request, Response, Router } from 'express';

// ── Types ──

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface HealthCheck {
  name: string;
  status: HealthStatus;
  responseTime: number;
  message?: string;
  lastChecked: Date;
}

export interface HealthReport {
  status: HealthStatus;
  timestamp: Date;
  uptime: number;
  checks: HealthCheck[];
}

// ── Configuration ──

interface HealthConfig {
  dbPool?: Pool;
  externalServices?: { name: string; url: string }[];
  memoryThresholdPercent?: number;
  diskThresholdPercent?: number;
}

let config: HealthConfig = {};

export function configureHealth(options: HealthConfig): void {
  config = { ...config, ...options };
}

// ── Individual Checks ──

export async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();
  const check: HealthCheck = {
    name: 'database',
    status: 'healthy',
    responseTime: 0,
    lastChecked: new Date(),
  };

  if (!config.dbPool) {
    check.status = 'unhealthy';
    check.message = 'Database pool not configured';
    check.responseTime = Date.now() - start;
    return check;
  }

  try {
    const client = await config.dbPool.connect();
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout (5s)')), 5000)
      );
      const queryPromise = client.query('SELECT 1 AS health_check');
      await Promise.race([queryPromise, timeoutPromise]);
      check.status = 'healthy';
      check.message = 'PostgreSQL connection successful';
    } finally {
      client.release();
    }
  } catch (error) {
    check.status = 'unhealthy';
    check.message = error instanceof Error ? error.message : 'Database check failed';
  }

  check.responseTime = Date.now() - start;
  return check;
}

export async function checkMemory(): Promise<HealthCheck> {
  const start = Date.now();
  const memUsage = process.memoryUsage();
  const totalSystemMemory = os.totalmem();
  const usedPercent = (memUsage.rss / totalSystemMemory) * 100;
  const threshold = config.memoryThresholdPercent ?? 90;

  let status: HealthStatus = 'healthy';
  if (usedPercent > threshold) {
    status = 'unhealthy';
  } else if (usedPercent > threshold * 0.8) {
    status = 'degraded';
  }

  return {
    name: 'memory',
    status,
    responseTime: Date.now() - start,
    message: `RSS: ${(memUsage.rss / 1024 / 1024).toFixed(1)}MB | Heap: ${(memUsage.heapUsed / 1024 / 1024).toFixed(1)}MB/${(memUsage.heapTotal / 1024 / 1024).toFixed(1)}MB | System: ${usedPercent.toFixed(1)}% of ${(totalSystemMemory / 1024 / 1024 / 1024).toFixed(1)}GB`,
    lastChecked: new Date(),
  };
}

export async function checkDiskSpace(): Promise<HealthCheck> {
  const start = Date.now();
  const check: HealthCheck = {
    name: 'disk',
    status: 'healthy',
    responseTime: 0,
    lastChecked: new Date(),
  };

  try {
    const stats = fs.statfsSync('/');
    const totalBytes = stats.bsize * stats.blocks;
    const freeBytes = stats.bsize * stats.bavail;
    const usedPercent = ((totalBytes - freeBytes) / totalBytes) * 100;
    const threshold = config.diskThresholdPercent ?? 90;

    if (usedPercent > threshold) {
      check.status = 'unhealthy';
    } else if (usedPercent > threshold * 0.8) {
      check.status = 'degraded';
    }

    check.message = `Used: ${usedPercent.toFixed(1)}% | Free: ${(freeBytes / 1024 / 1024 / 1024).toFixed(1)}GB / ${(totalBytes / 1024 / 1024 / 1024).toFixed(1)}GB`;
  } catch (error) {
    check.status = 'degraded';
    check.message = error instanceof Error ? error.message : 'Disk check failed';
  }

  check.responseTime = Date.now() - start;
  return check;
}

export async function checkUptime(): Promise<HealthCheck> {
  const start = Date.now();
  const uptimeSeconds = process.uptime();
  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);

  return {
    name: 'uptime',
    status: 'healthy',
    responseTime: Date.now() - start,
    message: `${days}d ${hours}h ${minutes}m | PID: ${process.pid}`,
    lastChecked: new Date(),
  };
}

export async function checkExternalServices(): Promise<HealthCheck[]> {
  const services = config.externalServices ?? [];
  const checks: HealthCheck[] = [];

  for (const service of services) {
    const start = Date.now();
    const check: HealthCheck = {
      name: `external:${service.name}`,
      status: 'healthy',
      responseTime: 0,
      lastChecked: new Date(),
    };

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(service.url, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        check.status = 'healthy';
        check.message = `HTTP ${response.status}`;
      } else {
        check.status = 'degraded';
        check.message = `HTTP ${response.status} ${response.statusText}`;
      }
    } catch (error) {
      check.status = 'unhealthy';
      check.message = error instanceof Error ? error.message : 'Service unreachable';
    }

    check.responseTime = Date.now() - start;
    checks.push(check);
  }

  return checks;
}

// ── Aggregate Report ──

export async function getHealthReport(): Promise<HealthReport> {
  const checks: HealthCheck[] = [];

  const [dbCheck, memCheck, diskCheck, uptimeCheck, externalChecks] = await Promise.allSettled([
    checkDatabase(),
    checkMemory(),
    checkDiskSpace(),
    checkUptime(),
    checkExternalServices(),
  ]);

  if (dbCheck.status === 'fulfilled') checks.push(dbCheck.value);
  if (memCheck.status === 'fulfilled') checks.push(memCheck.value);
  if (diskCheck.status === 'fulfilled') checks.push(diskCheck.value);
  if (uptimeCheck.status === 'fulfilled') checks.push(uptimeCheck.value);
  if (externalChecks.status === 'fulfilled') checks.push(...externalChecks.value);

  // Aggregate status: worst status wins
  let aggregateStatus: HealthStatus = 'healthy';
  for (const check of checks) {
    if (check.status === 'unhealthy') {
      aggregateStatus = 'unhealthy';
      break;
    }
    if (check.status === 'degraded') {
      aggregateStatus = 'degraded';
    }
  }

  return {
    status: aggregateStatus,
    timestamp: new Date(),
    uptime: process.uptime(),
    checks,
  };
}

// ── Periodic Monitor ──

let monitorInterval: ReturnType<typeof setInterval> | null = null;

export function startHealthMonitor(intervalMs: number): void {
  if (monitorInterval) {
    clearInterval(monitorInterval);
  }

  console.log(`[HealthMonitor] Starting periodic health checks every ${intervalMs}ms`);

  monitorInterval = setInterval(async () => {
    try {
      const report = await getHealthReport();
      const logLevel = report.status === 'healthy' ? 'info' : report.status === 'degraded' ? 'warn' : 'error';
      const failedChecks = report.checks.filter((c) => c.status !== 'healthy');

      console[logLevel](
        JSON.stringify({
          timestamp: report.timestamp.toISOString(),
          level: logLevel,
          message: 'Health check',
          status: report.status,
          uptime: Math.floor(report.uptime),
          failedChecks: failedChecks.map((c) => ({ name: c.name, status: c.status, message: c.message })),
        })
      );
    } catch (error) {
      console.error('[HealthMonitor] Error running health check:', error);
    }
  }, intervalMs);

  // Don't prevent process exit
  if (monitorInterval.unref) {
    monitorInterval.unref();
  }
}

export function stopHealthMonitor(): void {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
    console.log('[HealthMonitor] Stopped');
  }
}

// ── Express Route Handlers ──

export function healthRouter(): Router {
  const router = Router();

  // Simple health check - returns 200 if healthy, 503 if not
  router.get('/health', async (_req: Request, res: Response) => {
    try {
      const report = await getHealthReport();
      const statusCode = report.status === 'unhealthy' ? 503 : 200;

      res.status(statusCode).json({
        status: report.status,
        timestamp: report.timestamp.toISOString(),
        uptime: Math.floor(report.uptime),
      });
    } catch {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      });
    }
  });

  // Detailed health check - returns full report with all check details
  router.get('/health/detailed', async (_req: Request, res: Response) => {
    try {
      const report = await getHealthReport();
      const statusCode = report.status === 'unhealthy' ? 503 : 200;

      res.status(statusCode).json({
        status: report.status,
        timestamp: report.timestamp.toISOString(),
        uptime: Math.floor(report.uptime),
        checks: report.checks.map((check) => ({
          name: check.name,
          status: check.status,
          responseTime: check.responseTime,
          message: check.message,
          lastChecked: check.lastChecked.toISOString(),
        })),
      });
    } catch {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      });
    }
  });

  return router;
}
