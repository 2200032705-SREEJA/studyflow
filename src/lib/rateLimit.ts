/**
 * Per-user daily generation cap.
 *
 * Nothing currently stops one account from hammering /explain, /plan,
 * /review, /viva in a tight loop, and each call costs real LLM tokens.
 * This is a simple in-memory sliding-window counter keyed by userId.
 *
 * NOTE: this resets on server restart and does not share state across
 * multiple server instances. That's fine for a single-instance deploy;
 * at real scale, swap the Map below for a Redis INCR + EXPIRE (or a
 * Postgres row with a unique (userId, day) key) so the count is shared
 * across instances and survives restarts. The function signature below
 * is written so that swap doesn't require touching any route handler.
 */

const DAILY_LIMIT = Number(process.env.DAILY_GENERATION_LIMIT ?? 50);
const WINDOW_MS = 24 * 60 * 60 * 1000;

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
}

/**
 * Call once per generation request (explain/plan/review/viva). Returns
 * whether the request is allowed and increments the count if so.
 */
export function checkRateLimit(userId: string): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(userId);

  if (!existing || now - existing.windowStart >= WINDOW_MS) {
    // First request from this user, or the previous 24h window has expired.
    buckets.set(userId, { count: 1, windowStart: now });
    return { allowed: true, remaining: DAILY_LIMIT - 1, limit: DAILY_LIMIT, resetAt: now + WINDOW_MS };
  }

  if (existing.count >= DAILY_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      limit: DAILY_LIMIT,
      resetAt: existing.windowStart + WINDOW_MS
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: DAILY_LIMIT - existing.count,
    limit: DAILY_LIMIT,
    resetAt: existing.windowStart + WINDOW_MS
  };
}