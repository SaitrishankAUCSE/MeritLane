import { NextRequest } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStores = new Map<string, Map<string, RateLimitEntry>>();

/**
 * In-memory sliding window rate limiter
 * @param namespace Unique key for the endpoint or feature (e.g., 'ats-check', 'contact')
 * @param identifier Client identifier (IP address, user UID, etc.)
 * @param limit Maximum allowed requests in the window
 * @param windowMs Time window in milliseconds
 * @returns { success: boolean; remaining: number; reset: number }
 */
export function checkRateLimit(
  namespace: string,
  identifier: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  if (!rateLimitStores.has(namespace)) {
    rateLimitStores.set(namespace, new Map());
  }
  const store = rateLimitStores.get(namespace)!;

  // Cleanup expired entries when store grows to avoid memory leaks
  if (store.size > 2000) {
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt <= now) {
        store.delete(key);
      }
    }
  }

  const existing = store.get(identifier);
  if (!existing || existing.resetAt <= now) {
    store.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      success: true,
      remaining: limit - 1,
      reset: now + windowMs,
    };
  }

  if (existing.count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: existing.resetAt,
    };
  }

  existing.count += 1;
  return {
    success: true,
    remaining: limit - existing.count,
    reset: existing.resetAt,
  };
}

/**
 * Helper to safely extract client IP from NextRequest
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
