import { db } from '@repo/database';
import type { BrowserImplementations } from '@repo/database/schema';
import { computeMinVersions } from '@repo/helpers/browser/baseline-support';
import { CORE_BROWSERS } from '@repo/helpers/browser/detect-browser';
import { eq } from 'drizzle-orm';

type ApiFeature = {
  feature_id: string;
  name: string;
  baseline: {
    status: 'newly' | 'widely';
    low_date: string;
    high_date?: string;
  };
  browser_implementations?: BrowserImplementations;
};

type ApiResponse = {
  data: ApiFeature[];
  metadata: {
    total: number;
    next_page_token?: string;
  };
};

type BaselineFeature = {
  featureId: string;
  name: string;
  status: 'newly' | 'widely';
  date: string;
};

type SyncResult = {
  newFeatures: BaselineFeature[];
  statusChanges: Array<{
    feature: BaselineFeature;
    previousStatus: string;
  }>;
};

const MAX_PAGES = 50;

const fetchPage = async (
  status: 'newly' | 'widely',
  pageToken?: string,
): Promise<ApiResponse> => {
  const params = new URLSearchParams({
    q: `baseline_status:${status}`,
    page_size: '100',
  });
  if (pageToken !== undefined) {
    params.set('page_token', pageToken);
  }

  const res = await fetch(
    `https://api.webstatus.dev/v1/features?${params.toString()}`,
  );
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  const json: unknown = await res.json();
  if (!isApiResponse(json)) {
    const preview = JSON.stringify(json).slice(0, 200);
    throw new Error(`Invalid webstatus API response shape: ${preview}`);
  }
  return json;
};

const isApiFeature = (value: unknown): value is ApiFeature => {
  if (typeof value !== 'object' || value === null) return false;
  if (!('feature_id' in value) || typeof value.feature_id !== 'string')
    return false;
  if (!('name' in value) || typeof value.name !== 'string') return false;
  if (!('baseline' in value)) return false;
  const { baseline } = value;
  if (typeof baseline !== 'object' || baseline === null) return false;
  if (
    !('status' in baseline) ||
    (baseline.status !== 'newly' && baseline.status !== 'widely')
  )
    return false;
  if (!('low_date' in baseline) || typeof baseline.low_date !== 'string')
    return false;
  if (
    'high_date' in baseline &&
    baseline.high_date !== undefined &&
    typeof baseline.high_date !== 'string'
  )
    return false;
  if (
    'browser_implementations' in value &&
    value.browser_implementations !== undefined &&
    (typeof value.browser_implementations !== 'object' ||
      value.browser_implementations === null)
  )
    return false;
  return true;
};

const isApiResponse = (value: unknown): value is ApiResponse => {
  if (typeof value !== 'object' || value === null) return false;
  if (!('data' in value) || !Array.isArray(value.data)) return false;
  if (!value.data.every(isApiFeature)) return false;
  if (!('metadata' in value)) return false;
  const { metadata } = value;
  if (typeof metadata !== 'object' || metadata === null) return false;
  if (!('total' in metadata) || typeof metadata.total !== 'number')
    return false;
  if (
    'next_page_token' in metadata &&
    metadata.next_page_token !== undefined &&
    typeof metadata.next_page_token !== 'string'
  )
    return false;
  return true;
};

const fetchAllFeatures = async (
  status: 'newly' | 'widely',
  pageToken?: string,
  accumulated: ApiFeature[] = [],
  currentPage = 1,
): Promise<ApiFeature[]> => {
  if (currentPage > MAX_PAGES) {
    console.warn(
      `最大ページ数(${String(MAX_PAGES)})に達しました: status=${status}`,
    );
    return accumulated;
  }
  const page = await fetchPage(status, pageToken);
  const features = [...accumulated, ...page.data];
  if (page.metadata.next_page_token !== undefined) {
    return fetchAllFeatures(
      status,
      page.metadata.next_page_token,
      features,
      currentPage + 1,
    );
  }
  return features;
};

const toBaselineFeature = (feature: ApiFeature): BaselineFeature => ({
  featureId: feature.feature_id,
  name: feature.name,
  status: feature.baseline.status,
  date:
    feature.baseline.status === 'widely' &&
    feature.baseline.high_date !== undefined
      ? feature.baseline.high_date
      : feature.baseline.low_date,
});

type SnapshotRow = {
  featureId: string;
  name: string;
  status: 'newly' | 'widely';
  date: string;
  browserImplementations: BrowserImplementations | undefined;
};

// browser_implementations の差分検知はキー順に依存しないよう正規化して比較する。
// DB 由来(JSON.parse)と webstatus API レスポンスでキー順が異なり得るため。
const stableStringify = (value: unknown): string =>
  JSON.stringify(value, (_key, v: unknown) =>
    v !== null && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(
          Object.entries(v as Record<string, unknown>).toSorted(([a], [b]) =>
            a.localeCompare(b),
          ),
        )
      : v,
  );

export async function syncBaseline(): Promise<SyncResult> {
  const [newlyFeatures, widelyFeatures] = await Promise.all([
    fetchAllFeatures('newly'),
    fetchAllFeatures('widely'),
  ]);

  const allFeatures = [...newlyFeatures, ...widelyFeatures];

  const existingSnapshots = await db
    .select({
      featureId: db._schema.baselineSnapshots.featureId,
      status: db._schema.baselineSnapshots.status,
      browserImplementations:
        db._schema.baselineSnapshots.browserImplementations,
    })
    .from(db._schema.baselineSnapshots);
  const existingByFeatureId = new Map(
    existingSnapshots.map((s) => [s.featureId, s]),
  );

  const newFeatures: BaselineFeature[] = [];
  const statusChanges: SyncResult['statusChanges'] = [];
  const toInsert: SnapshotRow[] = [];
  const toUpdate: SnapshotRow[] = [];

  for (const apiFeature of allFeatures) {
    const feature = toBaselineFeature(apiFeature);
    const row: SnapshotRow = {
      ...feature,
      browserImplementations: apiFeature.browser_implementations,
    };
    const existing = existingByFeatureId.get(feature.featureId);
    if (!existing) {
      newFeatures.push(feature);
      toInsert.push(row);
      continue;
    }
    const statusChanged = existing.status !== feature.status;
    // browser_implementations は status 変化が無くても更新され得るため差分で検知する。
    const implementationsChanged =
      stableStringify(existing.browserImplementations ?? null) !==
      stableStringify(row.browserImplementations ?? null);
    if (statusChanged) {
      statusChanges.push({ feature, previousStatus: existing.status });
    }
    if (statusChanged || implementationsChanged) {
      toUpdate.push(row);
    }
  }

  if (toInsert.length > 0) {
    await db.insert(db._schema.baselineSnapshots).values(toInsert);
  }

  if (toUpdate.length > 0) {
    await db.transaction((tx) =>
      Promise.all(
        toUpdate.map((item) =>
          tx
            .update(db._schema.baselineSnapshots)
            .set({
              status: item.status,
              date: item.date,
              name: item.name,
              browserImplementations: item.browserImplementations,
            })
            .where(eq(db._schema.baselineSnapshots.featureId, item.featureId)),
        ),
      ),
    );
  }

  await syncBrowserSupport(allFeatures);

  return { newFeatures, statusChanges };
}

// アプリが動作保証する各ブラウザの最低版を、全 Baseline 機能から算出して upsert する。
// フロアは公開サイトの警告と admin 表示が参照する。
async function syncBrowserSupport(features: ApiFeature[]): Promise<void> {
  const minVersions = computeMinVersions(
    features
      .map((f) => f.browser_implementations)
      .filter((impl): impl is BrowserImplementations => impl !== undefined),
  );

  // 算出できたブラウザだけを書き込む。webstatus の一時的な異常応答(空データ等)で
  // minVersions が空になったとき、既存フロアを null で潰さないようスキップする。
  const now = new Date().toISOString();
  const rows = CORE_BROWSERS.filter(
    (browser) => minVersions[browser] !== undefined,
  ).map((browser) => ({
    browser,
    version: minVersions[browser] ?? null,
    updatedAt: now,
  }));
  if (rows.length === 0) {
    return;
  }

  await db.transaction((tx) =>
    Promise.all(
      rows.map((row) =>
        tx
          .insert(db._schema.browserSupport)
          .values(row)
          .onConflictDoUpdate({
            target: db._schema.browserSupport.browser,
            set: { version: row.version, updatedAt: row.updatedAt },
          }),
      ),
    ),
  );
}
