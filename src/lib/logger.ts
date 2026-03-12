// Lightweight structured logger that works in both server and client
// Uses console methods but adds structure (timestamp, level, context)
// In production, these get picked up by Vercel's log drain

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, context?: LogContext) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  switch (level) {
    case "error":
      console.error(JSON.stringify(entry));
      break;
    case "warn":
      console.warn(JSON.stringify(entry));
      break;
    case "info":
      console.info(JSON.stringify(entry));
      break;
    case "debug":
      if (process.env.NODE_ENV !== "production")
        console.debug(JSON.stringify(entry));
      break;
  }

  // Report errors to Sentry
  if (level === "error" && context?.error instanceof Error) {
    try {
      // Dynamic import to avoid bundling Sentry on paths that don't need it
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Sentry = require("@sentry/nextjs");
      Sentry.captureException(context.error, { extra: context });
    } catch {
      // Sentry not available — that's fine, we still logged to console
    }
  }
}

export const logger = {
  debug: (msg: string, ctx?: LogContext) => log("debug", msg, ctx),
  info: (msg: string, ctx?: LogContext) => log("info", msg, ctx),
  warn: (msg: string, ctx?: LogContext) => log("warn", msg, ctx),
  error: (msg: string, ctx?: LogContext) => log("error", msg, ctx),
};
