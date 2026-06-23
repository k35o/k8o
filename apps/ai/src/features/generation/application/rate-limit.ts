// オーナー専用ツールだが、暴走ループ等で Fugu の枠を浪費しないための安全網。
// スライディング1時間ウィンドウで上限を超えたら弾く。上限は env で調整可能。
// ここは純粋ロジックのみ（DB アクセスは route が usage-repository と組み合わせる）。
const WINDOW_MS = 60 * 60 * 1000;
const DEFAULT_LIMIT = 60;

const parseLimit = (raw: string | undefined): number => {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : DEFAULT_LIMIT;
};

export const generationLimit = (): number =>
  parseLimit(process.env['AI_GENERATE_LIMIT_PER_HOUR']);

// ウィンドウ開始時刻（ISO）。now を引数に取り決定的・テスタブルにする。
export const windowStartIso = (now: number): string =>
  new Date(now - WINDOW_MS).toISOString();

export const isOverLimit = (count: number, limit: number): boolean =>
  count >= limit;
