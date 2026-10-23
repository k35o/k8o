import { Hono } from 'hono';

import { publicCacheControl } from '../../../shared/cache/public-cache-control';
import { fetchUserContributions } from '../infrastructure/contributions';

type Contributions = Awaited<ReturnType<typeof fetchUserContributions>>;

const GITHUB_USER = 'k35o';
const MAX_AGE_SECONDS = 600;
const FAILURE_MEMO_MS = 60_000;

// パスの書き方（パーセント符号化やドットのセグメント）を変えた URL は CDN のキャッシュを外して
// ここまで届く。GitHub を呼ぶ回数を URL の数から切り離すため、インスタンスの中で結果を使い回す。
// 失敗も短く覚え、GitHub が断っているあいだに呼び続けない
let pending: Promise<Contributions> | undefined;
let recent: { days: Contributions; expiresAt: number } | undefined;

const loadContributions = async (): Promise<Contributions> => {
  const days = await fetchUserContributions(GITHUB_USER);
  recent = {
    days,
    expiresAt:
      Date.now() + (days === null ? FAILURE_MEMO_MS : MAX_AGE_SECONDS * 1000),
  };
  return days;
};

const memoizedContributions = (): Promise<Contributions> => {
  if (recent !== undefined && Date.now() < recent.expiresAt) {
    return Promise.resolve(recent.days);
  }
  pending ??= loadContributions().finally(() => {
    pending = undefined;
  });
  return pending;
};

export const githubPublicRoutes = new Hono().get(
  '/contributions',
  async (c) => {
    const days = await memoizedContributions();
    if (days === null) {
      return c.json({ ok: false, error: 'upstream_error' } as const, 502);
    }
    return c.json({ days }, 200, {
      'Cache-Control': publicCacheControl({
        maxAge: MAX_AGE_SECONDS,
        sMaxAge: 10_800,
      }),
    });
  },
);
