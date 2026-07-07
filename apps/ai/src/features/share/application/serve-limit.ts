// 課金保護: 公開共有（/s/[slug]）の Sandbox serve/起動を、プロセス内クールダウンでは効かない
// クロスインスタンスのグローバル上限で縛る安全網（1時間スライディングウィンドウ、上限は env で調整可能）。
// プロセス内 single-flight（serve-cooldown）が warm 中の重複を吸収する上で、これは cold start/起動の
// 絶対数を DB カウントで縛る二層目にあたる。
const WINDOW_MS = 60 * 60 * 1000;
const DEFAULT_LIMIT = 30;

const parseLimit = (raw: string | undefined): number => {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : DEFAULT_LIMIT;
};

export const shareServeLimit = (): number =>
  parseLimit(process.env['AI_SHARE_SERVE_LIMIT_PER_HOUR']);

// now を引数に取り決定的に保つ。
export const serveWindowStartIso = (now: number): string =>
  new Date(now - WINDOW_MS).toISOString();

export const isOverServeLimit = (count: number, limit: number): boolean =>
  count >= limit;

type GatedServeDeps = {
  slug: string;
  // 決定的テスト用に now/limit/count/serve/record を注入する。
  now: number;
  limit: number;
  countRecentServes: (input: { sinceIso: string }) => Promise<number>;
  serve: () => Promise<string | null>;
  recordServe: (input: { slug: string }) => Promise<void>;
};

// DB のグローバル上限を評価してから serve し、実際に serve できた分だけ記録する。
// - over-limit のときは serve せず（＝課金させず）null を返す。
// - fail-open: カウント取得の DB エラーで公開ページを壊さない（配信を続ける）。
// - 記録失敗は配信を止めない（best-effort）。
// resolveServeWithCooldown に渡す serve として合成される前提で、warm な cache/in-flight ヒットは
// 呼び出し側の single-flight が弾くため、ここへ来た時点で「実際に serve する」呼び出しである。
export const gatedServe = async (
  deps: GatedServeDeps,
): Promise<string | null> => {
  let overLimit = false;
  try {
    const recent = await deps.countRecentServes({
      sinceIso: serveWindowStartIso(deps.now),
    });
    overLimit = isOverServeLimit(recent, deps.limit);
  } catch (error) {
    console.error(
      '共有 serve レート制限のカウント取得に失敗（fail-open で配信）',
      error,
    );
  }
  if (overLimit) {
    return null;
  }

  const url = await deps.serve();
  if (url !== null) {
    try {
      await deps.recordServe({ slug: deps.slug });
    } catch (error) {
      console.error('共有 serve 利用ログの記録に失敗', error);
    }
  }
  return url;
};
