import type { BrowserImplementationMap } from '@repo/helpers/browser/browser-support';
import { computeMinVersions } from '@repo/helpers/browser/browser-support';
import { CORE_BROWSERS } from '@repo/helpers/browser/detect-browser';
import type {
  CoreBrowser,
  BrowserMinVersions,
} from '@repo/helpers/browser/detect-browser';

import { browsers, features } from '../infrastructure/web-features-source';

// web-features データの構造的サブセット。実データ(features/browsers)もテスト用の
// fixture もこの形に代入できるため、変換ロジックを純粋に保てる。
export type SupportVersions = Partial<Record<CoreBrowser, string>>;

export type FeatureStatusLike = {
  baseline: boolean | 'high' | 'low';
  baseline_low_date?: string;
  baseline_high_date?: string;
  support: SupportVersions;
};

export type FeatureLike = {
  kind: string;
  name?: string;
  status?: FeatureStatusLike;
  // moved / split エントリの後継 feature ID。
  redirect_target?: string;
  redirect_targets?: string[];
};

export type FeaturesLike = Record<string, FeatureLike>;

export type BrowsersLike = Partial<
  Record<
    CoreBrowser,
    { releases: ReadonlyArray<{ version: string; date: string }> }
  >
>;

export type SupportStatus = 'widely' | 'newly' | 'limited';

// 既存の公開ページが依存する形。baseline 済(newly/widely)のみを含む。
export type ReachedFeature = {
  featureId: string;
  name: string;
  status: 'newly' | 'widely';
  date: string;
};

export type BrowserAvailability = {
  browser: CoreBrowser;
  version: string;
  date: string | null;
};

export type BrowserSupportFeature = {
  featureId: string;
  name: string;
  status: SupportStatus;
  // baseline 到達日(newly/widely のみ)。limited は null。
  baselineDate: string | null;
  // フィード整列用の「直近で動いた日」。baseline は baseline 日、limited は
  // 最後にブラウザが対応した日。
  resolvedDate: string;
  support: BrowserAvailability[];
};

// baseline 未達(limited)は「直近1年でブラウザが動いた」ものだけをフィードに載せ、
// 何年も単一ブラウザのままの古い機能を除外する。
const RECENT_LIMITED_WINDOW_MS = 365 * 24 * 60 * 60 * 1000;

type ResolvedFeature = {
  featureId: string;
  name: string;
  status: FeatureStatusLike;
};

const resolveFeatures = (featuresData: FeaturesLike): ResolvedFeature[] => {
  const resolved: ResolvedFeature[] = [];
  for (const [featureId, data] of Object.entries(featuresData)) {
    // moved / split は別 ID への redirect のため除外。status を持つ feature のみ扱う。
    if (data.kind !== 'feature' || data.status === undefined) {
      continue;
    }
    resolved.push({
      featureId,
      name: data.name ?? featureId,
      status: data.status,
    });
  }
  return resolved;
};

const toSupportStatus = (baseline: boolean | 'high' | 'low'): SupportStatus => {
  if (baseline === 'high') {
    return 'widely';
  }
  if (baseline === 'low') {
    return 'newly';
  }
  return 'limited';
};

// web-features は baseline 到達日が不確かなとき "≤2022-09-24" のように ≤ を前置する。
// 表示(new Date)や比較のため接頭辞を外して素の日付にする(webstatus.dev も除去済み)。
const normalizeBaselineDate = (date: string): string => date.replace(/^≤/u, '');

const baselineDateOf = (status: FeatureStatusLike): string | null => {
  if (status.baseline === 'high') {
    const date = status.baseline_high_date ?? status.baseline_low_date;
    return date === undefined ? null : normalizeBaselineDate(date);
  }
  if (status.baseline === 'low') {
    return status.baseline_low_date === undefined
      ? null
      : normalizeBaselineDate(status.baseline_low_date);
  }
  return null;
};

const makeReleaseDateResolver = (
  browsersData: BrowsersLike,
): ((browser: CoreBrowser, version: string) => string | null) => {
  const lookup = new Map<string, string>();
  for (const browser of CORE_BROWSERS) {
    const data = browsersData[browser];
    if (data === undefined) {
      continue;
    }
    for (const release of data.releases) {
      lookup.set(`${browser}@${release.version}`, release.date);
    }
  }
  return (browser, version) => lookup.get(`${browser}@${version}`) ?? null;
};

const toSupport = (
  support: SupportVersions,
  resolveDate: (browser: CoreBrowser, version: string) => string | null,
): BrowserAvailability[] => {
  const rows: BrowserAvailability[] = [];
  for (const browser of CORE_BROWSERS) {
    const version = support[browser];
    if (version === undefined || version === '') {
      continue;
    }
    rows.push({ browser, version, date: resolveDate(browser, version) });
  }
  return rows;
};

// support の中で最も新しいリリース日(=最後にブラウザが対応した日)。
const lastShippedDate = (support: BrowserAvailability[]): string | null => {
  let latest: string | null = null;
  for (const row of support) {
    if (row.date !== null && (latest === null || row.date > latest)) {
      latest = row.date;
    }
  }
  return latest;
};

export const selectReachedFeatures = (
  featuresData: FeaturesLike,
): ReachedFeature[] => {
  const result: ReachedFeature[] = [];
  for (const { featureId, name, status } of resolveFeatures(featuresData)) {
    if (status.baseline !== 'high' && status.baseline !== 'low') {
      continue;
    }
    const date = baselineDateOf(status);
    if (date === null) {
      continue;
    }
    result.push({
      featureId,
      name,
      status: status.baseline === 'high' ? 'widely' : 'newly',
      date,
    });
  }
  return result.toSorted((a, b) => b.date.localeCompare(a.date));
};

const toBrowserSupportFeature = (
  { featureId, name, status }: ResolvedFeature,
  resolveDate: (browser: CoreBrowser, version: string) => string | null,
): BrowserSupportFeature => {
  const support = toSupport(status.support, resolveDate);
  const baselineDate = baselineDateOf(status);
  return {
    featureId,
    name,
    status: toSupportStatus(status.baseline),
    baselineDate,
    resolvedDate: baselineDate ?? lastShippedDate(support) ?? '',
    support,
  };
};

export const selectBrowserSupportFeatures = (
  featuresData: FeaturesLike,
  browsersData: BrowsersLike,
  nowMs: number,
): BrowserSupportFeature[] => {
  const resolveDate = makeReleaseDateResolver(browsersData);
  const recentCutoff = nowMs - RECENT_LIMITED_WINDOW_MS;
  const result: BrowserSupportFeature[] = [];

  for (const resolved of resolveFeatures(featuresData)) {
    const feature = toBrowserSupportFeature(resolved, resolveDate);
    // 日付が定まらない機能はフィード（年別・整列）に載せない。
    if (feature.resolvedDate === '') {
      continue;
    }
    // baseline 未達(limited)は「直近1年でブラウザが動いた」ものだけ載せ、何年も
    // 単一ブラウザのままの古い機能を除外する。baseline 済は常に載せる。
    if (
      feature.status === 'limited' &&
      new Date(feature.resolvedDate).getTime() < recentCutoff
    ) {
      continue;
    }
    result.push(feature);
  }

  return result.toSorted((a, b) =>
    b.resolvedDate.localeCompare(a.resolvedDate),
  );
};

// moved / split は別 ID への redirect。後継(split は先頭)を辿り有効な feature に解決する。
const resolveRedirect = (
  featuresData: FeaturesLike,
  featureId: string,
  depth = 0,
): ResolvedFeature | null => {
  if (depth > 5) {
    return null;
  }
  const data = featuresData[featureId];
  if (data === undefined) {
    return null;
  }
  if (data.kind === 'feature' && data.status !== undefined) {
    return { featureId, name: data.name ?? featureId, status: data.status };
  }
  const target = data.redirect_target ?? data.redirect_targets?.[0];
  if (target === undefined) {
    return null;
  }
  return resolveRedirect(featuresData, target, depth + 1);
};

export const selectFeatureStatus = (
  featuresData: FeaturesLike,
  browsersData: BrowsersLike,
  featureId: string,
): BrowserSupportFeature | null => {
  const resolved = resolveRedirect(featuresData, featureId);
  if (resolved === null) {
    return null;
  }
  return toBrowserSupportFeature(
    resolved,
    makeReleaseDateResolver(browsersData),
  );
};

export const computeBrowserMinVersions = (
  featuresData: FeaturesLike,
): BrowserMinVersions => {
  const maps: BrowserImplementationMap[] = [];
  for (const { status } of resolveFeatures(featuresData)) {
    if (status.baseline !== 'high' && status.baseline !== 'low') {
      continue;
    }
    const map: BrowserImplementationMap = {};
    for (const browser of CORE_BROWSERS) {
      const version = status.support[browser];
      if (version !== undefined && version !== '') {
        map[browser] = { version, status: 'available' };
      }
    }
    maps.push(map);
  }
  return computeMinVersions(maps);
};

export const getReachedFeatures = (): ReachedFeature[] =>
  selectReachedFeatures(features);

export const getBrowserSupportFeatures = (
  nowMs: number,
): BrowserSupportFeature[] =>
  selectBrowserSupportFeatures(features, browsers, nowMs);

export const getFeatureStatus = (
  featureId: string,
): BrowserSupportFeature | null =>
  selectFeatureStatus(features, browsers, featureId);
