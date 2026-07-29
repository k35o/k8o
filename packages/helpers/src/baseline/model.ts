import type {
  BrowserMinVersions,
  CoreBrowser,
} from '../browser/detect-browser';
import { CORE_BROWSERS } from '../browser/detect-browser';

export type BaselineSupportStatus = 'widely' | 'newly' | 'limited';

export type BaselineBrowserSupport = {
  browser: CoreBrowser;
  version: string;
  // そのバージョンのリリース日。上流の browsers.releases から取り込み時に解決する。
  date: string | null;
};

export type BaselineFeature = {
  featureId: string;
  name: string;
  status: BaselineSupportStatus;
  // baseline 到達日(newly/widely のみ)。limited は null。
  baselineDate: string | null;
  // フィード整列用の「直近で動いた日」。baseline は baseline 日、limited は最後に
  // ブラウザが対応した日。どちらも解決できない場合は '' (フィード非表示)。
  resolvedDate: string;
  support: BaselineBrowserSupport[];
};

// k8o が所有する正規化済みモデル。上流(web-features)のフォーマットには依存せず、
// 上流の癖(≤付き日付・moved/split・high/low語彙)は取り込み時の変換で吸収済み。
export type BaselineDataset = {
  schemaVersion: typeof BASELINE_DATASET_SCHEMA_VERSION;
  upstreamVersion: string;
  features: BaselineFeature[];
  // moved/split の旧 feature ID → 有効な feature ID(チェーン解決済み)。
  redirects: Record<string, string>;
  // 全 baseline(newly/widely)機能から算出したブラウザ最低版フロア。
  minVersions: BrowserMinVersions;
};

export const BASELINE_DATASET_SCHEMA_VERSION = 1;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const CORE_BROWSER_SET: ReadonlySet<string> = new Set(CORE_BROWSERS);

const isSupportRow = (value: unknown): value is BaselineBrowserSupport =>
  isRecord(value) &&
  typeof value['browser'] === 'string' &&
  CORE_BROWSER_SET.has(value['browser']) &&
  typeof value['version'] === 'string' &&
  (value['date'] === null || typeof value['date'] === 'string');

const isBaselineFeature = (value: unknown): value is BaselineFeature =>
  isRecord(value) &&
  typeof value['featureId'] === 'string' &&
  typeof value['name'] === 'string' &&
  (value['status'] === 'widely' ||
    value['status'] === 'newly' ||
    value['status'] === 'limited') &&
  (value['baselineDate'] === null ||
    typeof value['baselineDate'] === 'string') &&
  typeof value['resolvedDate'] === 'string' &&
  Array.isArray(value['support']) &&
  value['support'].every((row) => isSupportRow(row));

// DB から読んだ JSON を自前スキーマとして検証する。自分が書いたデータであっても、
// 将来の schemaVersion 不一致や手動編集の破損を「表示エラー」ではなく「データ無し」に
// 落とすため、読み取り側は必ずここを通す。
export const parseBaselineDataset = (raw: unknown): BaselineDataset | null => {
  if (!isRecord(raw)) {
    return null;
  }
  if (raw['schemaVersion'] !== BASELINE_DATASET_SCHEMA_VERSION) {
    return null;
  }
  if (typeof raw['upstreamVersion'] !== 'string') {
    return null;
  }
  const { features } = raw;
  if (
    !Array.isArray(features) ||
    !features.every((f) => isBaselineFeature(f))
  ) {
    return null;
  }
  const { redirects } = raw;
  if (
    !isRecord(redirects) ||
    !Object.values(redirects).every((v) => typeof v === 'string')
  ) {
    return null;
  }
  const { minVersions } = raw;
  if (
    !isRecord(minVersions) ||
    !Object.entries(minVersions).every(
      ([browser, version]) =>
        CORE_BROWSER_SET.has(browser) && typeof version === 'string',
    )
  ) {
    return null;
  }
  return {
    schemaVersion: BASELINE_DATASET_SCHEMA_VERSION,
    upstreamVersion: raw['upstreamVersion'],
    features,
    redirects: redirects as Record<string, string>,
    minVersions,
  };
};

if (import.meta.vitest) {
  const validFeature: BaselineFeature = {
    featureId: 'grid',
    name: 'Grid',
    status: 'widely',
    baselineDate: '2020-01-15',
    resolvedDate: '2020-01-15',
    support: [{ browser: 'chrome', version: '57', date: '2017-03-09' }],
  };

  const validDataset: BaselineDataset = {
    schemaVersion: 1,
    upstreamVersion: '3.34.2',
    features: [validFeature],
    redirects: { 'old-grid': 'grid' },
    minVersions: { chrome: '57' },
  };

  describe('parseBaselineDataset', () => {
    describe('正常系', () => {
      it('自前スキーマに適合する JSON をそのまま返す', () => {
        expect(parseBaselineDataset(validDataset)).toStrictEqual(validDataset);
      });

      it('シリアライズを経由した複製も受け付ける', () => {
        expect(
          parseBaselineDataset(structuredClone(validDataset)),
        ).toStrictEqual(validDataset);
      });
    });

    describe('異常系', () => {
      it('schemaVersion が異なると null', () => {
        expect(
          parseBaselineDataset({ ...validDataset, schemaVersion: 2 }),
        ).toBeNull();
      });

      it('features に不正な要素が混ざると null', () => {
        expect(
          parseBaselineDataset({
            ...validDataset,
            features: [{ ...validFeature, status: 'high' }],
          }),
        ).toBeNull();
      });

      it('support のブラウザキーがコア7ブラウザ外だと null', () => {
        expect(
          parseBaselineDataset({
            ...validDataset,
            features: [
              {
                ...validFeature,
                support: [{ browser: 'opera', version: '1', date: null }],
              },
            ],
          }),
        ).toBeNull();
      });

      it('オブジェクトでない入力は null', () => {
        expect(parseBaselineDataset(null)).toBeNull();
        expect(parseBaselineDataset('[]')).toBeNull();
      });
    });
  });
}
