import { logger } from '../../../utils/logger';
import { tokenTracker } from '../../../core/llm/token-tracker';

export type ServiceStatus = 'ok' | 'warn' | 'critical';
export type AlertSeverity = 'warn' | 'critical';

export interface LatencyCheck {
  service: string;
  latencyMs: number;
  status: ServiceStatus;
}

export interface ErrorLogEntry {
  logged: boolean;
  errorId: string;
  severity: AlertSeverity;
  timestamp: string;
}

export interface TokenReport {
  totalTokens: number;
  byAgent: Record<string, number>;
  byModel: Record<string, number>;
  dailyAverage: number;
  budgetUsedPercent: number;
}

export interface ContainerHealth {
  name: string;
  status: 'running' | 'stopped' | 'restarting' | 'unhealthy';
  cpuPercent: number;
  memoryMb: number;
  uptime: string;
  restartCount: number;
}

export interface AvatarCacheStats {
  sarahHitRate: number;
  emmanuelHitRate: number;
  totalSessions: number;
  didUsageToday: number;
  didDailyLimit: number;
}

const LATENCY_WARN_MS = 2000;
const LATENCY_CRITICAL_MS = 5000;
const TOKEN_BUDGET_MONTHLY = 10_000_000;

export function classifyLatency(latencyMs: number): ServiceStatus {
  if (latencyMs >= LATENCY_CRITICAL_MS) return 'critical';
  if (latencyMs >= LATENCY_WARN_MS) return 'warn';
  return 'ok';
}

export async function checkLatency(service: string): Promise<LatencyCheck> {
  // Stub — real implementation pings the actual service
  const latencyMs = Math.floor(Math.random() * 500) + 50;
  const status = classifyLatency(latencyMs);
  logger.info('Latency check (stub)', { service, latencyMs, status });
  return { service, latencyMs, status };
}

export async function logError(
  error: string,
  context: Record<string, unknown>
): Promise<ErrorLogEntry> {
  const errorId = `err_${Date.now()}`;
  const severity: AlertSeverity = (context['critical'] as boolean) ? 'critical' : 'warn';
  logger.error('Error logged', { errorId, error, context });
  return { logged: true, errorId, severity, timestamp: new Date().toISOString() };
}

export function reportTokenUsage(budgetMonthly = TOKEN_BUDGET_MONTHLY): TokenReport {
  const totalTokens = tokenTracker.getTotalTokens();
  const byAgent = tokenTracker.getTokensByAgent();
  const byModel = tokenTracker.getTokensByModel();
  const dailyAverage = tokenTracker.getDailyAverage();
  const budgetUsedPercent = Math.round((totalTokens / budgetMonthly) * 100);

  logger.info('Token usage report generated', { totalTokens, budgetUsedPercent });
  return { totalTokens, byAgent, byModel, dailyAverage, budgetUsedPercent };
}

export async function checkContainerHealth(): Promise<ContainerHealth[]> {
  // Stub — real implementation queries Docker API
  logger.info('Container health check (stub)');
  return [
    { name: 'sarah-api', status: 'running', cpuPercent: 12, memoryMb: 256, uptime: '3d 14h', restartCount: 0 },
    { name: 'sarah-postgres', status: 'running', cpuPercent: 5, memoryMb: 512, uptime: '3d 14h', restartCount: 0 },
    { name: 'sarah-redis', status: 'running', cpuPercent: 2, memoryMb: 64, uptime: '3d 14h', restartCount: 0 },
    { name: 'sarah-avatar-pipeline', status: 'running', cpuPercent: 30, memoryMb: 1024, uptime: '3d 14h', restartCount: 0 },
  ];
}

export async function checkAvatarCache(): Promise<AvatarCacheStats> {
  // Stub — real implementation queries avatar cache service
  logger.info('Avatar cache check (stub)');
  return {
    sarahHitRate: 0.92,
    emmanuelHitRate: 0.88,
    totalSessions: 47,
    didUsageToday: 120,
    didDailyLimit: 500,
  };
}
