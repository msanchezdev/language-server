import packageJson from '../package.json';

let currentLogLevel = 1;
const LOG_LEVELS = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};
export const logger = {
  getLogLevel() {
    return currentLogLevel;
  },
  setLogLevel(level: keyof typeof LOG_LEVELS) {
    currentLogLevel = LOG_LEVELS[level];
  },
  error(...args: any[]) {
    if (currentLogLevel < LOG_LEVELS.error) {
      return;
    }

    console.error(`[${packageJson.name}] ERROR`, ...args);
  },
  warn(...args: any[]) {
    if (currentLogLevel < LOG_LEVELS.warn) {
      return;
    }

    console.warn(`[${packageJson.name}] WARN`, ...args);
  },
  info(...args: any[]) {
    if (currentLogLevel < LOG_LEVELS.info) {
      return;
    }

    console.info(`[${packageJson.name}] INFO`, ...args);
  },
  debug(...args: any[]) {
    if (currentLogLevel < LOG_LEVELS.debug) {
      return;
    }

    console.debug(`[${packageJson.name}] DEBUG`, ...args);
  },
  trace(...args: any[]) {
    if (currentLogLevel < LOG_LEVELS.trace) {
      return;
    }

    console.trace(`[${packageJson.name}] TRACE`, ...args);
  },
};
