import { getDatabase, runSqliteTransaction } from "@/lib/sqlite-store";

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
  blockMs?: number;
};

type RateLimitRow = {
  window_start: number;
  count: number;
  blocked_until: number | null;
};

export function getClientIpFromHeaders(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headers.get("x-real-ip")?.trim();

  return forwardedFor || realIp || "unknown";
}

export function checkRateLimit({
  key,
  limit,
  windowMs,
  blockMs = windowMs,
}: RateLimitOptions): RateLimitResult {
  const now = Date.now();

  return runSqliteTransaction(() => {
    const row = getDatabase()
      .prepare("SELECT window_start, count, blocked_until FROM rate_limits WHERE key = ?")
      .get(key) as RateLimitRow | undefined;

    if (row?.blocked_until && row.blocked_until > now) {
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil((row.blocked_until - now) / 1000),
      };
    }

    const isFreshWindow = !row || now - row.window_start >= windowMs;
    const windowStart = isFreshWindow ? now : row.window_start;
    const count = isFreshWindow ? 1 : row.count + 1;
    const blockedUntil = count > limit ? now + blockMs : null;

    getDatabase()
      .prepare(
        `
          INSERT INTO rate_limits (key, window_start, count, blocked_until)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(key) DO UPDATE SET
            window_start = excluded.window_start,
            count = excluded.count,
            blocked_until = excluded.blocked_until
        `,
      )
      .run(key, windowStart, count, blockedUntil);

    return {
      allowed: count <= limit,
      retryAfterSeconds: blockedUntil ? Math.ceil(blockMs / 1000) : 0,
    };
  });
}

export function clearRateLimit(key: string) {
  getDatabase().prepare("DELETE FROM rate_limits WHERE key = ?").run(key);
}
