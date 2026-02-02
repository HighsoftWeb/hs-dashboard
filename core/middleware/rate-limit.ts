import { NextRequest } from "next/server";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 100;

function getClientId(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown";
  return ip;
}

function cleanup(): void {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
}

export function rateLimit(request: NextRequest): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  cleanup();

  const clientId = getClientId(request);
  const now = Date.now();

  if (!store[clientId] || store[clientId].resetAt < now) {
    store[clientId] = {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    };
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetAt: store[clientId].resetAt,
    };
  }

  store[clientId].count += 1;

  const allowed = store[clientId].count <= RATE_LIMIT_MAX_REQUESTS;

  return {
    allowed,
    remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - store[clientId].count),
    resetAt: store[clientId].resetAt,
  };
}

export function rateLimitLogin(request: NextRequest): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  cleanup();

  const clientId = getClientId(request);
  const now = Date.now();
  const loginWindow = 60 * 1000;
  const loginMax = 5;

  const key = `login:${clientId}`;

  if (!store[key] || store[key].resetAt < now) {
    store[key] = {
      count: 1,
      resetAt: now + loginWindow,
    };
    return {
      allowed: true,
      remaining: loginMax - 1,
      resetAt: store[key].resetAt,
    };
  }

  store[key].count += 1;

  const allowed = store[key].count <= loginMax;

  return {
    allowed,
    remaining: Math.max(0, loginMax - store[key].count),
    resetAt: store[key].resetAt,
  };
}
