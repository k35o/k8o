// 公開共有の閲覧（/s/[slug]）は未認証。匿名トラフィックが slug ごとに Vercel Sandbox の
// cold start を無制限に誘発しないよう、プロセス内で配信URLを短期キャッシュし、同一 slug への
// 同時/連続リクエストで serve() を多重に呼ばない（single-flight + TTL クールダウン）。
// サーバレスではインスタンス跨ぎで best-effort だが、warm 中の繰り返し閲覧という主要コストを抑える。
// TTL は Sandbox の idle timeout(5分) より十分短く、キャッシュ中の URL は生存しているとみなせる。
const COOLDOWN_MS = 30_000;

type CacheEntry = { url: string; expiresAt: number };

const urlCache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<string | null>>();

// serve は最大でも slug ごとに COOLDOWN_MS に1回しか呼ばれない。now は決定的テスト用。
export const resolveServeWithCooldown = (
  slug: string,
  serve: () => Promise<string | null>,
  now: number = Date.now(),
): Promise<string | null> => {
  const cached = urlCache.get(slug);
  if (cached !== undefined && cached.expiresAt > now) {
    return Promise.resolve(cached.url);
  }

  // 配信中（cold start を含む）の同一 slug リクエストは1本にまとめる（thundering herd 防止）。
  const pending = inFlight.get(slug);
  if (pending !== undefined) {
    return pending;
  }

  const task = (async (): Promise<string | null> => {
    try {
      const url = await serve();
      if (url !== null) {
        urlCache.set(slug, { url, expiresAt: now + COOLDOWN_MS });
      }
      return url;
    } finally {
      inFlight.delete(slug);
    }
  })();
  inFlight.set(slug, task);
  return task;
};
