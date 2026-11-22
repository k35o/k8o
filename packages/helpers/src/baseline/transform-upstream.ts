import { compareVersions } from '../browser/compare-versions.ts';
import { CORE_BROWSERS } from '../browser/core-browsers.ts';
import type { BrowserMinVersions } from '../browser/core-browsers.ts';
import { isRecord } from './is-record.ts';
import type {
  BaselineBrowserSupport,
  BaselineDataset,
  BaselineFeature,
  BaselineSupportStatus,
} from './model.ts';
import { BASELINE_DATASET_SCHEMA_VERSION } from './model.ts';

// 上流(web-features data.json)のフォーマットに触れるのはこのファイルだけ。
// 上流の破壊的変更はここの変換失敗(throw / skip)として現れ、コンパイルエラーにはならない。

export class UpstreamFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UpstreamFormatError';
  }
}

export type SkippedFeature = { featureId: string; reason: string };

export type UpstreamTransformResult = {
  dataset: BaselineDataset;
  skippedFeatures: SkippedFeature[];
};

// 上流は baseline 到達日が不確かなとき "≤2022-09-24" のように ≤ を前置する。
const normalizeDate = (date: string): string => date.replace(/^≤/u, '');

const YMD_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;

// 未確定日付(≤前置)を許容しつつ YYYY-MM-DD へ正規化する。適合しなければ null。
const readDate = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = normalizeDate(value);
  return YMD_PATTERN.test(normalized) ? normalized : null;
};

type ReleaseDateResolver = (browser: string, version: string) => string | null;

const buildReleaseDateResolver = (
  browsersRaw: unknown,
): ReleaseDateResolver => {
  const lookup = new Map<string, string>();
  if (isRecord(browsersRaw)) {
    for (const browser of CORE_BROWSERS) {
      const entry = browsersRaw[browser];
      if (!isRecord(entry) || !Array.isArray(entry['releases'])) {
        continue;
      }
      for (const release of entry['releases']) {
        if (!isRecord(release) || typeof release['version'] !== 'string') {
          continue;
        }
        const date = readDate(release['date']);
        if (date !== null) {
          lookup.set(`${browser}@${release['version']}`, date);
        }
      }
    }
  }
  return (browser, version) => lookup.get(`${browser}@${version}`) ?? null;
};

const toStatus = (baseline: unknown): BaselineSupportStatus | null => {
  if (baseline === 'high') {
    return 'widely';
  }
  if (baseline === 'low') {
    return 'newly';
  }
  if (baseline === false) {
    return 'limited';
  }
  return null;
};

const toSupport = (
  supportRaw: Record<string, unknown>,
  resolveDate: ReleaseDateResolver,
): BaselineBrowserSupport[] => {
  const rows: BaselineBrowserSupport[] = [];
  // 上流に知らないブラウザキーが増えても壊れないよう、コア7ブラウザだけを拾う。
  for (const browser of CORE_BROWSERS) {
    const version = supportRaw[browser];
    if (typeof version !== 'string' || version === '') {
      continue;
    }
    rows.push({ browser, version, date: resolveDate(browser, version) });
  }
  return rows;
};

const lastShippedDate = (support: BaselineBrowserSupport[]): string | null => {
  let latest: string | null = null;
  for (const row of support) {
    if (row.date !== null && (latest === null || row.date > latest)) {
      latest = row.date;
    }
  }
  return latest;
};

type ParsedFeature =
  | { kind: 'feature'; feature: BaselineFeature }
  | { kind: 'redirect'; target: string }
  | { kind: 'skip'; reason: string };

const parseFeatureEntry = (
  featureId: string,
  entry: unknown,
  resolveDate: ReleaseDateResolver,
): ParsedFeature => {
  if (!isRecord(entry)) {
    return { kind: 'skip', reason: 'entry is not an object' };
  }

  if (entry['kind'] === 'moved') {
    return typeof entry['redirect_target'] === 'string'
      ? { kind: 'redirect', target: entry['redirect_target'] }
      : { kind: 'skip', reason: 'moved without redirect_target' };
  }
  if (entry['kind'] === 'split') {
    const targets = entry['redirect_targets'];
    // split は後継が複数ある。表示は先頭の後継に寄せる。
    return Array.isArray(targets) && typeof targets[0] === 'string'
      ? { kind: 'redirect', target: targets[0] }
      : { kind: 'skip', reason: 'split without redirect_targets' };
  }
  if (entry['kind'] !== 'feature') {
    return { kind: 'skip', reason: `unknown kind: ${String(entry['kind'])}` };
  }

  const { status } = entry;
  if (!isRecord(status)) {
    return { kind: 'skip', reason: 'feature without status' };
  }
  const supportStatus = toStatus(status['baseline']);
  if (supportStatus === null) {
    return {
      kind: 'skip',
      reason: `unknown baseline value: ${String(status['baseline'])}`,
    };
  }
  const supportRaw = status['support'];
  if (!isRecord(supportRaw)) {
    return { kind: 'skip', reason: 'feature without support' };
  }

  const lowDate = readDate(status['baseline_low_date']);
  const highDate = readDate(status['baseline_high_date']);
  const baselineDate =
    supportStatus === 'widely'
      ? (highDate ?? lowDate)
      : supportStatus === 'newly'
        ? lowDate
        : null;

  const support = toSupport(supportRaw, resolveDate);
  return {
    kind: 'feature',
    feature: {
      featureId,
      name: typeof entry['name'] === 'string' ? entry['name'] : featureId,
      status: supportStatus,
      baselineDate,
      resolvedDate: baselineDate ?? lastShippedDate(support) ?? '',
      support,
    },
  };
};

const REDIRECT_MAX_DEPTH = 5;

const resolveRedirects = (
  candidates: Map<string, string>,
  featureIds: ReadonlySet<string>,
): { redirects: Record<string, string>; unresolved: SkippedFeature[] } => {
  const redirects: Record<string, string> = {};
  const unresolved: SkippedFeature[] = [];
  for (const [from] of candidates) {
    let current = from;
    let resolved: string | null = null;
    for (let depth = 0; depth < REDIRECT_MAX_DEPTH; depth++) {
      const next = candidates.get(current);
      if (next === undefined) {
        break;
      }
      if (featureIds.has(next)) {
        resolved = next;
        break;
      }
      current = next;
    }
    if (resolved === null) {
      unresolved.push({ featureId: from, reason: 'unresolved redirect' });
    } else {
      redirects[from] = resolved;
    }
  }
  return { redirects, unresolved };
};

const computeDatasetMinVersions = (
  features: readonly BaselineFeature[],
): BrowserMinVersions => {
  const minVersions: BrowserMinVersions = {};
  for (const feature of features) {
    if (feature.status === 'limited') {
      continue;
    }
    for (const { browser, version } of feature.support) {
      const current = minVersions[browser];
      if (current === undefined || compareVersions(version, current) > 0) {
        minVersions[browser] = version;
      }
    }
  }
  return minVersions;
};

export const transformUpstreamData = (
  raw: unknown,
  upstreamVersion: string,
): UpstreamTransformResult => {
  if (!isRecord(raw)) {
    throw new UpstreamFormatError('data.json のルートがオブジェクトではない');
  }
  const featuresRaw = raw['features'];
  if (!isRecord(featuresRaw)) {
    throw new UpstreamFormatError('features がオブジェクトではない');
  }
  if (!isRecord(raw['browsers'])) {
    throw new UpstreamFormatError('browsers がオブジェクトではない');
  }

  const resolveDate = buildReleaseDateResolver(raw['browsers']);
  const features: BaselineFeature[] = [];
  const redirectCandidates = new Map<string, string>();
  const skippedFeatures: SkippedFeature[] = [];

  for (const [featureId, entry] of Object.entries(featuresRaw)) {
    const parsed = parseFeatureEntry(featureId, entry, resolveDate);
    if (parsed.kind === 'feature') {
      features.push(parsed.feature);
    } else if (parsed.kind === 'redirect') {
      redirectCandidates.set(featureId, parsed.target);
    } else {
      skippedFeatures.push({ featureId, reason: parsed.reason });
    }
  }

  const featureIds = new Set(features.map((f) => f.featureId));
  const { redirects, unresolved } = resolveRedirects(
    redirectCandidates,
    featureIds,
  );
  skippedFeatures.push(...unresolved);

  return {
    dataset: {
      schemaVersion: BASELINE_DATASET_SCHEMA_VERSION,
      upstreamVersion,
      features: features.toSorted((a, b) =>
        b.resolvedDate.localeCompare(a.resolvedDate),
      ),
      redirects,
      minVersions: computeDatasetMinVersions(features),
    },
    skippedFeatures,
  };
};

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;
  const upstream = {
    browsers: {
      chrome: {
        releases: [
          { version: '120', date: '2024-01-15' },
          { version: '150', date: '2026-06-30' },
        ],
      },
      firefox: { releases: [{ version: '146', date: '2026-05-01' }] },
      safari: { releases: [{ version: '17.2', date: '2024-01-20' }] },
    },
    features: {
      'widely-feat': {
        kind: 'feature',
        name: 'Widely Feature',
        status: {
          baseline: 'high',
          baseline_low_date: '2021-01-01',
          baseline_high_date: '2023-07-01',
          support: { chrome: '120', firefox: '146', safari: '17.2' },
        },
      },
      'newly-feat': {
        kind: 'feature',
        name: 'Newly Feature',
        status: {
          baseline: 'low',
          // ≤ 前置は正規化して取り込む
          baseline_low_date: '≤2026-04-01',
          support: { chrome: '120', firefox: '146' },
        },
      },
      'limited-feat': {
        kind: 'feature',
        name: 'Limited Feature',
        status: {
          baseline: false,
          // edge はリリース表に無く日付を解決できないケースを兼ねる
          support: { chrome: '150', edge: '150' },
        },
      },
      'moved-entry': { kind: 'moved', redirect_target: 'widely-feat' },
      'chained-move': { kind: 'moved', redirect_target: 'moved-entry' },
      'split-entry': {
        kind: 'split',
        redirect_targets: ['newly-feat', 'widely-feat'],
      },
      'dead-redirect': { kind: 'moved', redirect_target: 'missing-feat' },
      'no-status': { kind: 'feature', name: 'No Status' },
    },
  };

  const feature = (
    status: BaselineSupportStatus,
    support: Array<[BaselineBrowserSupport['browser'], string]>,
  ): BaselineFeature => ({
    featureId: 'feat',
    name: 'Feature',
    status,
    baselineDate: null,
    resolvedDate: '',
    support: support.map(([browser, version]) => ({
      browser,
      version,
      date: null,
    })),
  });

  describe('computeDatasetMinVersions', () => {
    describe('正常系', () => {
      it('ブラウザごとに、baseline の機能が対応した版の最大値を取る', () => {
        expect(
          computeDatasetMinVersions([
            feature('widely', [
              ['chrome', '120'],
              ['safari', '17.2'],
            ]),
            feature('newly', [
              ['chrome', '143'],
              ['safari', '17.0'],
            ]),
          ]),
        ).toStrictEqual({ chrome: '143', safari: '17.2' });
      });

      it('版は文字列順ではなく数値として比べる', () => {
        expect(
          computeDatasetMinVersions([
            feature('widely', [['safari', '17.10']]),
            feature('widely', [['safari', '17.2']]),
          ]),
        ).toStrictEqual({ safari: '17.10' });
      });
    });

    describe('エッジケース', () => {
      it('limited の機能は数えない', () => {
        expect(
          computeDatasetMinVersions([
            feature('limited', [['chrome', '150']]),
            feature('newly', [['firefox', '146']]),
          ]),
        ).toStrictEqual({ firefox: '146' });
      });

      it('機能が無ければ空を返す', () => {
        expect(computeDatasetMinVersions([])).toStrictEqual({});
      });
    });
  });

  describe('transformUpstreamData', () => {
    describe('正常系', () => {
      const { dataset, skippedFeatures } = transformUpstreamData(
        upstream,
        '3.34.2',
      );

      it('baseline の語彙を widely/newly/limited へ写像する', () => {
        const byId = new Map(dataset.features.map((f) => [f.featureId, f]));
        expect(byId.get('widely-feat')?.status).toBe('widely');
        expect(byId.get('newly-feat')?.status).toBe('newly');
        expect(byId.get('limited-feat')?.status).toBe('limited');
      });

      it('≤ 前置の日付を正規化する', () => {
        const newly = dataset.features.find(
          (f) => f.featureId === 'newly-feat',
        );
        expect(newly?.baselineDate).toBe('2026-04-01');
      });

      it('support のリリース日を取り込み時に解決する', () => {
        const widely = dataset.features.find(
          (f) => f.featureId === 'widely-feat',
        );
        expect(widely?.support).toStrictEqual([
          { browser: 'chrome', version: '120', date: '2024-01-15' },
          { browser: 'firefox', version: '146', date: '2026-05-01' },
          { browser: 'safari', version: '17.2', date: '2024-01-20' },
        ]);
      });

      it('limited の resolvedDate は最後に対応したブラウザのリリース日になる', () => {
        const limited = dataset.features.find(
          (f) => f.featureId === 'limited-feat',
        );
        expect(limited?.baselineDate).toBeNull();
        expect(limited?.resolvedDate).toBe('2026-06-30');
      });

      it('moved/split をチェーン解決済みの redirects として抽出する', () => {
        expect(dataset.redirects).toStrictEqual({
          'moved-entry': 'widely-feat',
          'chained-move': 'widely-feat',
          'split-entry': 'newly-feat',
        });
      });

      it('features は resolvedDate 降順に整列される', () => {
        const dates = dataset.features.map((f) => f.resolvedDate);
        expect(dates).toStrictEqual([...dates].toSorted().toReversed());
      });

      it('baseline 機能から minVersions を算出する', () => {
        expect(dataset.minVersions).toStrictEqual({
          chrome: '120',
          firefox: '146',
          safari: '17.2',
        });
      });

      it('解決不能な redirect と status 欠落 feature は skip として報告する', () => {
        expect(
          skippedFeatures.map((s) => s.featureId).toSorted(),
        ).toStrictEqual(['dead-redirect', 'no-status']);
      });
    });

    describe('異常系', () => {
      it('ルートがオブジェクトでなければ UpstreamFormatError', () => {
        expect(() => transformUpstreamData([], '1.0.0')).toThrow(
          UpstreamFormatError,
        );
      });

      it('features が無ければ UpstreamFormatError', () => {
        expect(() => transformUpstreamData({ browsers: {} }, '1.0.0')).toThrow(
          UpstreamFormatError,
        );
      });

      it('未知の baseline 値の feature は全体を落とさず skip する', () => {
        const { dataset, skippedFeatures } = transformUpstreamData(
          {
            browsers: {},
            features: {
              odd: {
                kind: 'feature',
                status: { baseline: 'mid', support: {} },
              },
            },
          },
          '1.0.0',
        );
        expect(dataset.features).toStrictEqual([]);
        expect(skippedFeatures[0]?.reason).toContain('unknown baseline');
      });
    });

    describe('エッジケース', () => {
      it('コア7ブラウザ以外と空の版は minVersions に入れない', () => {
        const { dataset } = transformUpstreamData(
          {
            browsers: {},
            features: {
              feat: {
                kind: 'feature',
                status: {
                  baseline: 'low',
                  support: { chrome: '120', opera: '106', edge: '' },
                },
              },
            },
          },
          '1.0.0',
        );
        expect(dataset.minVersions).toStrictEqual({ chrome: '120' });
      });

      it('コア7ブラウザ以外の support キーは黙って無視する', () => {
        const { dataset } = transformUpstreamData(
          {
            browsers: {},
            features: {
              feat: {
                kind: 'feature',
                status: {
                  baseline: false,
                  support: { chrome: '100', opera: '90' },
                },
              },
            },
          },
          '1.0.0',
        );
        expect(dataset.features[0]?.support).toStrictEqual([
          { browser: 'chrome', version: '100', date: null },
        ]);
      });

      it('日付形式が崩れた baseline 日は無い扱いにする', () => {
        const { dataset } = transformUpstreamData(
          {
            browsers: {},
            features: {
              feat: {
                kind: 'feature',
                status: {
                  baseline: 'low',
                  baseline_low_date: '2026/04/01',
                  support: { chrome: '100' },
                },
              },
            },
          },
          '1.0.0',
        );
        expect(dataset.features[0]?.baselineDate).toBeNull();
        expect(dataset.features[0]?.resolvedDate).toBe('');
      });
    });
  });
}
