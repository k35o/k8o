// 公開共有の閲覧（/s/[slug]）は未認証。匿名トラフィックが slug ごとに Vercel Sandbox の
// cold start を無制限に誘発しないよう、プロセス内で配信URLを短期キャッシュし、同一 slug への
// 同時/連続リクエストで serve() を多重に呼ばない（single-flight + TTL クールダウン）。
// サーバレスではインスタンス跨ぎで best-effort だが、warm 中の繰り返し閲覧という主要コストを抑える。
// TTL は Sandbox の idle timeout(5分) より十分短く、キャッシュ中の URL は生存しているとみなせる。
const COOLDOWN_MS = 30_000;

type CacheEntry = { url: string; expiresAt: number };

const urlCache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<string | null>>();

// serve は最大でも slug ごとに COOLDOWN_MS に1回しか呼ばれない。clock は決定的テスト用の時刻源。
export const resolveServeWithCooldown = (
  slug: string,
  serve: () => Promise<string | null>,
  clock: () => number = () => Date.now(),
): Promise<string | null> => {
  const cached = urlCache.get(slug);
  if (cached !== undefined) {
    if (cached.expiresAt > clock()) {
      return Promise.resolve(cached.url);
    }
    // 期限切れは溜め込まず明示的に掃除する（未認証経路なので Map を肥大させない）。
    urlCache.delete(slug);
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
        // TTL は serve "完了" 時刻から測る。呼び出し時刻基準だと cold start が数十秒かかった
        // 場合にキャッシュした瞬間に失効し、肝心の cold start 抑制が効かなくなる。
        urlCache.set(slug, { url, expiresAt: clock() + COOLDOWN_MS });
      }
      return url;
    } catch {
      // serve 失敗（Sandbox.create 等の reject）は null に正規化する。キャッシュせず次回再試行。
      // ここで握らないと公開ページの spinner が固まる（呼び出し側 client は例外を捕捉しない）。
      return null;
    } finally {
      inFlight.delete(slug);
    }
  })();
  inFlight.set(slug, task);
  return task;
};
