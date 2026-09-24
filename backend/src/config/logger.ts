type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: string;
  stack?: string;
}

function formatLog(level: LogLevel, message: string, context?: Record<string, unknown>, err?: Error): string {
  const log: StructuredLog = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context && { context }),
    ...(err && {
      error: err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    }),
  };
  return JSON.stringify(log);
}

export const logger = {
  info(message: string, context?: Record<string, unknown>) {
    console.log(formatLog('info', message, context));
  },
  warn(message: string, context?: Record<string, unknown>) {
    console.warn(formatLog('warn', message, context));
  },
  error(message: string, context?: Record<string, unknown>, err?: Error) {
    console.error(formatLog('error', message, context, err));
  },
  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatLog('debug', message, context));
    }
  },
};
