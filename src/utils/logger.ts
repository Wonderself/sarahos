import winston from 'winston';

const LOG_LEVEL = process.env['LOG_LEVEL'] ?? 'info';
const NODE_ENV = process.env['NODE_ENV'] ?? 'development';

const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'ISO' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${String(timestamp)} [${level}] ${String(message)}${metaStr}`;
  })
);

export const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: NODE_ENV === 'production' ? jsonFormat : devFormat,
  defaultMeta: { service: 'freenzy' },
  transports: [
    new winston.transports.Console(),
    ...(NODE_ENV === 'production'
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error', maxsize: 10_000_000, maxFiles: 5 }),
          new winston.transports.File({ filename: 'logs/combined.log', maxsize: 10_000_000, maxFiles: 10 }),
        ]
      : []),
  ],
});

export function createAgentLogger(agentName: string): winston.Logger {
  return logger.child({ agent: agentName });
}
