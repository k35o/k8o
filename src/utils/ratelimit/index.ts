import 'server-only';

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// 一般API用レート制限（10req/10s）
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

// 認証用レート制限（厳格：5req/15min）
export const authRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
});

// フィードバック投稿用レート制限（3req/1min）
export const feedbackRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '1 m'),
  analytics: true,
});

// 管理者API用レート制限（100req/1min）
export const adminRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
});

// レート制限タイプ
export enum RateLimitType {
  GENERAL = 'general',
  AUTH = 'auth',
  FEEDBACK = 'feedback',
  ADMIN = 'admin',
}

// レート制限インスタンスを取得
export function getRateLimiter(type: RateLimitType): Ratelimit {
  switch (type) {
    case RateLimitType.AUTH:
      return authRatelimit;
    case RateLimitType.FEEDBACK:
      return feedbackRatelimit;
    case RateLimitType.ADMIN:
      return adminRatelimit;
    default:
      return ratelimit;
  }
}

// IP + ユーザーIDベースの識別子を生成
export function createRateLimitIdentifier(
  ip: string,
  userId?: string,
  type: RateLimitType = RateLimitType.GENERAL,
): string {
  const baseId = userId ? `user:${userId}` : `ip:${ip}`;
  return `${type}:${baseId}`;
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
