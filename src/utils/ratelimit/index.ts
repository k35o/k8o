import 'server-only';

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// 一般API用レート制限（10req/10s）
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

// フィードバック投稿用レート制限（3req/1min）
const feedbackRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '1 m'),
  analytics: true,
});

// レート制限タイプ
export enum RateLimitType {
  GENERAL = 'general',
  FEEDBACK = 'feedback',
}

// レート制限インスタンスを取得
export function getRateLimiter(type: RateLimitType): Ratelimit {
  switch (type) {
    case RateLimitType.FEEDBACK:
      return feedbackRatelimit;
    default:
      return ratelimit;
  }
}

// レート制限チェックのヘルパー関数
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = RateLimitType.GENERAL,
) {
  const limiter = getRateLimiter(type);
  const fullIdentifier = `${type}:${identifier}`;

  return await limiter.limit(fullIdentifier);
}
