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
export const RateLimitType = {
  GENERAL: 'general',
  FEEDBACK: 'feedback',
} as const;

export type RateLimitType = (typeof RateLimitType)[keyof typeof RateLimitType];

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

/**
 * テスト方針:
 *
 * このモジュールは 'server-only' を使用しており、サーバーサイド専用です。
 * また、Upstash Redis への実際の接続が必要なため、以下の理由により
 * in-source テストには適していません：
 *
 * 1. server-only 制約により通常のテスト環境では実行不可
 * 2. 外部サービス（Upstash Redis）への依存
 * 3. 環境変数（UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN）が必要
 *
 * 推奨されるテスト方法:
 *
 * - 統合テスト: 実際のRedis接続を使用したテスト
 *   - getRateLimiter() の動作確認
 *   - checkRateLimit() のレート制限動作確認
 *   - 異なるタイプ（GENERAL, FEEDBACK）の動作確認
 *
 * - E2Eテスト: API エンドポイント経由でのテスト
 *   - 実際のレート制限が機能することを確認
 *   - 制限超過時の動作確認
 *
 * テストケース（統合テスト用）:
 *
 * getRateLimiter():
 *   - GENERAL タイプで一般用レート制限を返す
 *   - FEEDBACK タイプでフィードバック用レート制限を返す
 *   - 未知のタイプでデフォルト（GENERAL）を返す
 *
 * checkRateLimit():
 *   - 識別子をタイプと組み合わせた形式（"type:identifier"）で使用
 *   - デフォルトで GENERAL タイプを使用
 *   - 制限内のリクエストは success: true を返す
 *   - 制限超過のリクエストは success: false を返す
 *   - GENERAL は 10req/10s、FEEDBACK は 3req/1min を正しく適用
 *
 * ratelimit instances:
 *   - ratelimit インスタンスが正しく初期化されている
 *   - feedbackRatelimit インスタンスが正しく初期化されている
 */
