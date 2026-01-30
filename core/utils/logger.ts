type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: string | number | boolean | null | undefined;
}

class Logger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = this.getTimestamp();
    const contextStr = context
      ? ` ${JSON.stringify(context)}`
      : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    const envLevel = (process.env.LOG_LEVEL || "info").toLowerCase();
    const levels: LogLevel[] = ["debug", "info", "warn", "error"];
    const envIndex = levels.indexOf(envLevel as LogLevel);
    const logIndex = levels.indexOf(level);
    return logIndex >= envIndex;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog("debug")) {
      console.debug(this.formatMessage("debug", message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog("info")) {
      console.info(this.formatMessage("info", message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog("error")) {
      const errorContext: LogContext = {
        ...context,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      };
      console.error(this.formatMessage("error", message, errorContext));
    }
  }
}

export const logger = new Logger();
