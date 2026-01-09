import { getRateLimitCollection } from '@/models/RateLimit';

export type RateLimitConfig = {
  key: string;
  windowMs: number;
  maxRequests: number;
  cooldownMs?: number;
};

export type RateLimitResult = {
  allowed: boolean;
  retryAfterMs?: number;
};

export async function enforceRateLimit(
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = new Date();
  const collection = await getRateLimitCollection();
  const existing = await collection.findOne({ key: config.key });

  if (existing) {
    const lastRequestedAt = existing.lastRequestedAt?.getTime() ?? 0;
    if (
      config.cooldownMs &&
      now.getTime() - lastRequestedAt < config.cooldownMs
    ) {
      return {
        allowed: false,
        retryAfterMs: config.cooldownMs - (now.getTime() - lastRequestedAt),
      };
    }

    const windowStartedAt = existing.windowStartedAt?.getTime() ?? 0;
    const inWindow = now.getTime() - windowStartedAt < config.windowMs;
    if (inWindow && existing.requestCount >= config.maxRequests) {
      return {
        allowed: false,
        retryAfterMs: config.windowMs - (now.getTime() - windowStartedAt),
      };
    }
  }

  const windowStartedAt =
    existing && now.getTime() - existing.windowStartedAt.getTime() < config.windowMs
      ? existing.windowStartedAt
      : now;
  const requestCount =
    existing && windowStartedAt === existing.windowStartedAt
      ? existing.requestCount + 1
      : 1;

  await collection.updateOne(
    { key: config.key },
    {
      $set: {
        key: config.key,
        windowStartedAt,
        requestCount,
        lastRequestedAt: now,
      },
    },
    { upsert: true }
  );

  return { allowed: true };
}
