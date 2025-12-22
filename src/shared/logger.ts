type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

let currentLevel: LogLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info';

export function setLogLevel(level: LogLevel) {
  currentLevel = level;
}

export function log(level: LogLevel, message: string, meta?: unknown) {
  if (levelPriority[level] < levelPriority[currentLevel]) return;
  const payload = meta ? [message, meta] : [message];
  // eslint-disable-next-line no-console
  console[level](...payload);
}
