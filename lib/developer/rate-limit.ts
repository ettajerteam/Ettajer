/**
 * Rate limiter backend interface.
 *
 * RATE_LIMIT_BACKEND=memory (default) — suitable for local / single-instance.
 * RATE_LIMIT_BACKEND=redis — production multi-instance (requires
 * UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN).
 *
 * API handlers depend only on DeveloperRateLimiter — never on a concrete class.
 */

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

export interface DeveloperRateLimiter {
  check(input: {
    key: string;
    limit: number;
    windowMs?: number;
  }): RateLimitResult | Promise<RateLimitResult>;
}

/** @deprecated Prefer DeveloperRateLimiter — alias kept for clarity in docs. */
export type RateLimiter = DeveloperRateLimiter;

type Bucket = { count: number; resetAt: number };

export class InMemoryDeveloperRateLimiter implements DeveloperRateLimiter {
  private buckets = new Map<string, Bucket>();

  check(input: {
    key: string;
    limit: number;
    windowMs?: number;
  }): RateLimitResult {
    const windowMs = input.windowMs ?? 60_000;
    const now = Date.now();
    const existing = this.buckets.get(input.key);

    if (!existing || existing.resetAt <= now) {
      const resetAt = now + windowMs;
      this.buckets.set(input.key, { count: 1, resetAt });
      return { ok: true, remaining: input.limit - 1, resetAt };
    }

    if (existing.count >= input.limit) {
      return { ok: false, remaining: 0, resetAt: existing.resetAt };
    }

    existing.count += 1;
    this.buckets.set(input.key, existing);
    return {
      ok: true,
      remaining: Math.max(0, input.limit - existing.count),
      resetAt: existing.resetAt,
    };
  }
}

/**
 * Redis-backed limiter.
 * Uses fetch against an Upstash-compatible REST API when UPSTASH_REDIS_REST_URL
 * + UPSTASH_REDIS_REST_TOKEN are set. Otherwise falls back to in-memory and logs once.
 *
 * No redis npm dependency required — keeps local installs light.
 */
export class RedisDeveloperRateLimiter implements DeveloperRateLimiter {
  private fallback = new InMemoryDeveloperRateLimiter();
  private warned = false;

  private get rest() {
    const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
    const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
    if (!url || !token) return null;
    return { url: url.replace(/\/$/, ""), token };
  }

  async check(input: {
    key: string;
    limit: number;
    windowMs?: number;
  }): Promise<RateLimitResult> {
    const rest = this.rest;
    if (!rest) {
      const isProd =
        process.env.VERCEL_ENV === "production" ||
        process.env.NODE_ENV === "production";
      if (isProd) {
        // Fail closed: do not silently pretend redis is multi-instance-safe.
        throw new Error(
          "RATE_LIMIT_BACKEND=redis requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in production",
        );
      }
      if (!this.warned) {
        this.warned = true;
        console.warn(
          "[rate-limit] RATE_LIMIT_BACKEND=redis but UPSTASH_REDIS_REST_URL/TOKEN unset — using in-memory fallback (dev only).",
        );
      }
      return this.fallback.check(input);
    }

    const windowMs = input.windowMs ?? 60_000;
    const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
    const redisKey = `ettajer:rl:${input.key}`;

    try {
      // INCR then EXPIRE on first hit (Upstash pipeline)
      const incrRes = await fetch(`${rest.url}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${rest.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", redisKey],
          ["PTTL", redisKey],
        ]),
      });
      if (!incrRes.ok) throw new Error(`redis status ${incrRes.status}`);
      const rows = (await incrRes.json()) as { result: number }[];
      const count = Number(rows?.[0]?.result ?? 0);
      let pttl = Number(rows?.[1]?.result ?? -1);

      if (count === 1 || pttl < 0) {
        await fetch(`${rest.url}/pexpire/${encodeURIComponent(redisKey)}/${windowMs}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${rest.token}` },
        });
        pttl = windowMs;
      }

      const resetAt = Date.now() + Math.max(pttl, 0);
      if (count > input.limit) {
        return { ok: false, remaining: 0, resetAt };
      }
      return {
        ok: true,
        remaining: Math.max(0, input.limit - count),
        resetAt,
      };
    } catch (err) {
      if (!this.warned) {
        this.warned = true;
        console.warn("[rate-limit] Redis check failed — falling back to memory", err);
      }
      return this.fallback.check(input);
    }
  }
}

/** Alias names matching the architecture diagram. */
export const InMemoryRateLimiter = InMemoryDeveloperRateLimiter;
export const RedisRateLimiter = RedisDeveloperRateLimiter;

function createLimiterFromEnv(): DeveloperRateLimiter {
  const backend = (process.env.RATE_LIMIT_BACKEND || "memory").toLowerCase();
  if (backend === "redis") return new RedisDeveloperRateLimiter();
  return new InMemoryDeveloperRateLimiter();
}

let backend: DeveloperRateLimiter = createLimiterFromEnv();

/** Replace the rate limiter implementation (tests / custom wiring). */
export function setDeveloperRateLimiter(next: DeveloperRateLimiter) {
  backend = next;
}

export function getDeveloperRateLimiter(): DeveloperRateLimiter {
  return backend;
}

export function checkDeveloperRateLimit(input: {
  key: string;
  limit: number;
  windowMs?: number;
}): RateLimitResult {
  const result = backend.check(input);
  if (result && typeof (result as Promise<RateLimitResult>).then === "function") {
    // Sync callers (unit tests) must use memory backend.
    return new InMemoryDeveloperRateLimiter().check(input);
  }
  return result as RateLimitResult;
}

export async function checkDeveloperRateLimitAsync(input: {
  key: string;
  limit: number;
  windowMs?: number;
}): Promise<RateLimitResult> {
  return Promise.resolve(backend.check(input));
}

/** Defaults: 120 req/min per application, 60 per token, 200 per IP. */
export function enforceDeveloperRateLimits(input: {
  applicationId: string;
  tokenKey: string;
  ip: string;
}) {
  const checks = [
    checkDeveloperRateLimit({ key: `app:${input.applicationId}`, limit: 120 }),
    checkDeveloperRateLimit({ key: `tok:${input.tokenKey}`, limit: 60 }),
    checkDeveloperRateLimit({ key: `ip:${input.ip}`, limit: 200 }),
  ];
  const blocked = checks.find((c) => !c.ok);
  return blocked ?? checks[0];
}

export async function enforceDeveloperRateLimitsAsync(input: {
  applicationId: string;
  tokenKey: string;
  ip: string;
}) {
  const checks = await Promise.all([
    checkDeveloperRateLimitAsync({ key: `app:${input.applicationId}`, limit: 120 }),
    checkDeveloperRateLimitAsync({ key: `tok:${input.tokenKey}`, limit: 60 }),
    checkDeveloperRateLimitAsync({ key: `ip:${input.ip}`, limit: 200 }),
  ]);
  const blocked = checks.find((c) => !c.ok);
  return blocked ?? checks[0];
}
