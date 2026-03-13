type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: string | number | boolean | null | undefined;
}

const SENSITIVE_FIELDS = [
  "senha",
  "password",
  "senha_usuario",
  "sen_usuario",
  "token",
  "jwt",
  "authorization",
  "api_key",
  "secret",
  "credential",
  "cnpj",
  "cpf",
  "cpf_cnpj",
];

class Logger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) {
      return undefined;
    }

    const sanitized: LogContext = { ...context };

    Object.keys(sanitized).forEach((key) => {
      const lowerKey = key.toLowerCase();
      if (
        SENSITIVE_FIELDS.some((field) => lowerKey.includes(field)) ||
        lowerKey.includes("secret") ||
        lowerKey.includes("key")
      ) {
        sanitized[key] = "[REDACTED]";
      }
    });

    return sanitized;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = this.getTimestamp();
    const sanitizedContext = this.sanitizeContext(context);
    const contextStr = sanitizedContext
      ? ` ${JSON.stringify(sanitizedContext)}`
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
      const sanitizedContext = this.sanitizeContext(context);
      const errorContext: LogContext = {
        ...sanitizedContext,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      };
      console.error(this.formatMessage("error", message, errorContext));
    }
  }
}

export const logger = new Logger();
