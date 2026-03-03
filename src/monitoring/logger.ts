// ── Types ──

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  context?: Record<string, unknown>;
}

// ── Log Level Priorities ──

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// ── ANSI Colors for Development Mode ──

const COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
};
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

// ── Logger Class ──

export class Logger {
  private service: string;
  private minLevel: LogLevel;
  private isProduction: boolean;

  constructor(service: string) {
    this.service = service;
    this.minLevel = (process.env['LOG_LEVEL'] as LogLevel) ?? 'info';
    this.isProduction = process.env['NODE_ENV'] === 'production';
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      message,
    };

    if (context && Object.keys(context).length > 0) {
      entry.context = context;
    }

    if (this.isProduction) {
      this.outputJson(level, entry);
    } else {
      this.outputColored(level, entry);
    }
  }

  private outputJson(level: LogLevel, entry: LogEntry): void {
    const output = JSON.stringify(entry);

    switch (level) {
      case 'debug':
      case 'info':
        process.stdout.write(output + '\n');
        break;
      case 'warn':
        process.stderr.write(output + '\n');
        break;
      case 'error':
        process.stderr.write(output + '\n');
        break;
    }
  }

  private outputColored(level: LogLevel, entry: LogEntry): void {
    const color = COLORS[level];
    const levelLabel = level.toUpperCase().padEnd(5);
    const timestamp = entry.timestamp;
    const service = entry.service;

    let output = `${DIM}${timestamp}${RESET} ${color}${BOLD}${levelLabel}${RESET} ${DIM}[${service}]${RESET} ${entry.message}`;

    if (entry.context) {
      const contextStr = JSON.stringify(entry.context, null, 2);
      output += ` ${DIM}${contextStr}${RESET}`;
    }

    switch (level) {
      case 'debug':
      case 'info':
        console.log(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'error':
        console.error(output);
        break;
    }
  }

  /**
   * Create a child logger with additional default context prefix.
   */
  child(subService: string): Logger {
    return new Logger(`${this.service}:${subService}`);
  }
}

// ── Factory Function ──

/**
 * Create a new Logger instance for the given service name.
 *
 * @param service - The name of the service or module (e.g., 'api', 'agent-manager', 'billing')
 * @returns A configured Logger instance
 *
 * @example
 * ```ts
 * const logger = createLogger('api');
 * logger.info('Server started', { port: 3000 });
 * logger.error('Failed to connect', { error: err.message });
 * ```
 */
export function createLogger(service: string): Logger {
  return new Logger(service);
}
