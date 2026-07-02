import { db } from '@repo/database';

import {
  stableStringify,
  syncBaseline,
  toBaselineFeature,
} from './sync-baseline';

vi.mock('@repo/database', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    transaction: vi.fn(),
    _schema: {
      baselineSnapshots: { featureId: 'feature_id' },
      browserSupport: { browser: 'browser' },
    },
  },
}));

type FetchedFeature = {
  feature_id: string;
  name: string;
  baseline: {
    status: 'newly' | 'widely';
    low_date: string;
    high_date?: string;
  };
  browser_implementations?: Record<
    string,
    { version?: string; status?: string; date?: string }
  >;
};

const apiFeature = (
  overrides: Partial<FetchedFeature> = {},
): FetchedFeature => ({
  feature_id: 'grid',
  name: 'Grid',
  baseline: { status: 'newly', low_date: '2024-01-01' },
  ...overrides,
});

const apiResponse = (
  data: unknown[],
  nextPageToken?: string,
): { ok: boolean; json: () => Promise<unknown> } => ({
  ok: true,
  json: () =>
    Promise.resolve({
      data,
      metadata: {
        total: data.length,
        ...(nextPageToken !== undefined && { next_page_token: nextPageToken }),
      },
    }),
});

const mockFetch = vi.fn<(input: string) => Promise<unknown>>();

// fetch URL の q パラメータ(baseline_status)と page_token ごとに応答を切り替える。
// 各 status にはページ単位の feature 配列を渡し、次ページがあれば
// next_page_token(=次ページの添字)を返す。
const respondByStatus = (responses: {
  newly?: unknown[][];
  widely?: unknown[][];
}): void => {
  mockFetch.mockImplementation((input: string) => {
    const url = new URL(input);
    const q = url.searchParams.get('q');
    const pages =
      (q === 'baseline_status:widely' ? responses.widely : responses.newly) ??
      [];
    const pageToken = url.searchParams.get('page_token');
    const index = pageToken === null ? 0 : Number(pageToken);
    const nextToken = index + 1 < pages.length ? String(index + 1) : undefined;
    return Promise.resolve(apiResponse(pages[index] ?? [], nextToken));
  });
};

const selectFromMock = vi.fn();
const insertValuesMock = vi.fn();
const txUpdateWhereMock = vi.fn();
const txUpdateSetMock = vi.fn();
const txOnConflictMock = vi.fn();
const txInsertValuesMock = vi.fn();
const tx = {
  update: vi.fn(),
  insert: vi.fn(),
};

describe('syncBaseline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockResolvedValue(apiResponse([]));

    selectFromMock.mockResolvedValue([]);
    vi.mocked(db.select).mockReturnValue({ from: selectFromMock } as never);
    vi.mocked(db.insert).mockReturnValue({ values: insertValuesMock } as never);

    txUpdateSetMock.mockReturnValue({ where: txUpdateWhereMock });
    tx.update.mockReturnValue({ set: txUpdateSetMock });
    txInsertValuesMock.mockReturnValue({
      onConflictDoUpdate: txOnConflictMock,
    });
    tx.insert.mockReturnValue({ values: txInsertValuesMock });
    vi.mocked(db.transaction).mockImplementation(((
      callback: (t: typeof tx) => Promise<unknown>,
    ) => callback(tx)) as never);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('正常系', () => {
    it('新規 feature を insert に振り分ける', async () => {
      respondByStatus({
        newly: [
          [
            apiFeature({
              browser_implementations: {
                chrome: { version: '100', status: 'available' },
              },
            }),
          ],
        ],
      });

      const result = await syncBaseline();

      expect(result.newFeatures).toEqual([
        {
          featureId: 'grid',
          name: 'Grid',
          status: 'newly',
          date: '2024-01-01',
        },
      ]);
      expect(result.statusChanges).toEqual([]);
      expect(insertValuesMock).toHaveBeenCalledWith([
        expect.objectContaining({
          featureId: 'grid',
          status: 'newly',
          browserImplementations: {
            chrome: { version: '100', status: 'available' },
          },
        }),
      ]);
      expect(tx.update).not.toHaveBeenCalled();
    });

    it('status 変化のみの feature を update に振り分ける', async () => {
      const impl = { chrome: { version: '100', status: 'available' } };
      selectFromMock.mockResolvedValue([
        { featureId: 'grid', status: 'newly', browserImplementations: impl },
      ]);
      respondByStatus({
        widely: [
          [
            apiFeature({
              baseline: {
                status: 'widely',
                low_date: '2024-01-01',
                high_date: '2026-07-01',
              },
              browser_implementations: impl,
            }),
          ],
        ],
      });

      const result = await syncBaseline();

      expect(result.newFeatures).toEqual([]);
      expect(result.statusChanges).toEqual([
        {
          feature: {
            featureId: 'grid',
            name: 'Grid',
            status: 'widely',
            date: '2026-07-01',
          },
          previousStatus: 'newly',
        },
      ]);
      expect(db.insert).not.toHaveBeenCalled();
      expect(tx.update).toHaveBeenCalledWith(db._schema.baselineSnapshots);
      expect(txUpdateSetMock).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'widely', date: '2026-07-01' }),
      );
    });

    it('browser_implementations のキー順違いだけなら差分なしとして更新しない', async () => {
      selectFromMock.mockResolvedValue([
        {
          featureId: 'grid',
          status: 'newly',
          browserImplementations: {
            firefox: { status: 'available', version: '90' },
            chrome: { version: '100', status: 'available' },
          },
        },
      ]);
      respondByStatus({
        newly: [
          [
            apiFeature({
              browser_implementations: {
                chrome: { status: 'available', version: '100' },
                firefox: { version: '90', status: 'available' },
              },
            }),
          ],
        ],
      });

      const result = await syncBaseline();

      expect(result.newFeatures).toEqual([]);
      expect(result.statusChanges).toEqual([]);
      expect(db.insert).not.toHaveBeenCalled();
      expect(tx.update).not.toHaveBeenCalled();
    });

    it('status 不変でも browser_implementations の内容が変われば update する', async () => {
      selectFromMock.mockResolvedValue([
        {
          featureId: 'grid',
          status: 'newly',
          browserImplementations: {
            chrome: { version: '100', status: 'available' },
          },
        },
      ]);
      respondByStatus({
        newly: [
          [
            apiFeature({
              browser_implementations: {
                chrome: { version: '101', status: 'available' },
              },
            }),
          ],
        ],
      });

      const result = await syncBaseline();

      expect(result.statusChanges).toEqual([]);
      expect(tx.update).toHaveBeenCalledWith(db._schema.baselineSnapshots);
      expect(txUpdateSetMock).toHaveBeenCalledWith(
        expect.objectContaining({
          browserImplementations: {
            chrome: { version: '101', status: 'available' },
          },
        }),
      );
    });

    it('全 feature から各ブラウザの最低対応版を browser_support へ upsert する', async () => {
      respondByStatus({
        newly: [
          [
            apiFeature({
              feature_id: 'a',
              browser_implementations: {
                chrome: { version: '100', status: 'available' },
                safari: { version: '17', status: 'available' },
              },
            }),
          ],
        ],
        widely: [
          [
            apiFeature({
              feature_id: 'b',
              baseline: {
                status: 'widely',
                low_date: '2020-01-01',
                high_date: '2023-01-01',
              },
              browser_implementations: {
                chrome: { version: '111', status: 'available' },
              },
            }),
          ],
        ],
      });

      await syncBaseline();

      expect(tx.insert).toHaveBeenCalledWith(db._schema.browserSupport);
      expect(txInsertValuesMock).toHaveBeenCalledWith(
        expect.objectContaining({ browser: 'chrome', version: '111' }),
      );
      expect(txInsertValuesMock).toHaveBeenCalledWith(
        expect.objectContaining({ browser: 'safari', version: '17' }),
      );
      expect(txOnConflictMock).toHaveBeenCalledWith(
        expect.objectContaining({ target: db._schema.browserSupport.browser }),
      );
    });

    it('minVersions が算出できないときは browser_support を書き込まない', async () => {
      // API 異常応答相当: browser_implementations が欠落した feature のみ
      respondByStatus({ newly: [[apiFeature({ feature_id: 'a' })]] });
      selectFromMock.mockResolvedValue([
        { featureId: 'a', status: 'newly', browserImplementations: undefined },
      ]);

      await syncBaseline();

      expect(tx.insert).not.toHaveBeenCalled();
      expect(db.transaction).not.toHaveBeenCalled();
    });
  });

  describe('異常系', () => {
    it('API が HTTP エラーを返したら例外を投げる', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });

      await expect(syncBaseline()).rejects.toThrow('API error: 500');
    });

    it('data が配列でない応答を型ガードで拒否する', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'broken', metadata: { total: 0 } }),
      });

      await expect(syncBaseline()).rejects.toThrow(
        /Invalid webstatus API response shape/u,
      );
    });

    it('feature_id が無い feature を含む応答を拒否する', async () => {
      mockFetch.mockResolvedValue(
        apiResponse([
          {
            name: 'Grid',
            baseline: { status: 'newly', low_date: '2024-01-01' },
          },
        ]),
      );

      await expect(syncBaseline()).rejects.toThrow(
        /Invalid webstatus API response shape/u,
      );
    });

    it('baseline.status が不正な feature を含む応答を拒否する', async () => {
      mockFetch.mockResolvedValue(
        apiResponse([
          apiFeature({
            baseline: {
              status: 'limited' as never,
              low_date: '2024-01-01',
            },
          }),
        ]),
      );

      await expect(syncBaseline()).rejects.toThrow(
        /Invalid webstatus API response shape/u,
      );
    });

    it('metadata.total が数値でない応答を拒否する', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [], metadata: { total: 'many' } }),
      });

      await expect(syncBaseline()).rejects.toThrow(
        /Invalid webstatus API response shape/u,
      );
    });
  });

  describe('エッジケース', () => {
    it('next_page_token が続く限り取得し全ページの feature を結合する', async () => {
      respondByStatus({
        newly: [
          [apiFeature({ feature_id: 'a', name: 'A' })],
          [apiFeature({ feature_id: 'b', name: 'B' })],
        ],
      });

      const result = await syncBaseline();

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result.newFeatures.map((f) => f.featureId)).toEqual(['a', 'b']);
    });

    it('next_page_token が尽きなくても MAX_PAGES で打ち切る', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockFetch.mockResolvedValue(apiResponse([], 'next'));

      const result = await syncBaseline();

      // newly / widely それぞれ 50 ページで打ち切られる
      expect(mockFetch).toHaveBeenCalledTimes(100);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('最大ページ数(50)に達しました'),
      );
      expect(result.newFeatures).toEqual([]);

      warnSpy.mockRestore();
    });
  });
});

describe('toBaselineFeature', () => {
  describe('正常系', () => {
    it('widely かつ high_date があれば date に high_date を使う', () => {
      const feature = toBaselineFeature({
        feature_id: 'grid',
        name: 'Grid',
        baseline: {
          status: 'widely',
          low_date: '2020-01-01',
          high_date: '2023-01-01',
        },
      });

      expect(feature).toEqual({
        featureId: 'grid',
        name: 'Grid',
        status: 'widely',
        date: '2023-01-01',
      });
    });
  });

  describe('エッジケース', () => {
    it('widely でも high_date が無ければ low_date を使う', () => {
      const feature = toBaselineFeature({
        feature_id: 'grid',
        name: 'Grid',
        baseline: { status: 'widely', low_date: '2020-01-01' },
      });

      expect(feature.date).toBe('2020-01-01');
    });

    it('newly は high_date があっても low_date を使う', () => {
      const feature = toBaselineFeature({
        feature_id: 'grid',
        name: 'Grid',
        baseline: {
          status: 'newly',
          low_date: '2024-01-01',
          high_date: '2026-07-01',
        },
      });

      expect(feature.date).toBe('2024-01-01');
    });
  });
});

describe('stableStringify', () => {
  describe('正常系', () => {
    it('キー順が異なる同内容のオブジェクトを同じ文字列にする', () => {
      const a = { chrome: { version: '100' }, firefox: { version: '90' } };
      const b = { firefox: { version: '90' }, chrome: { version: '100' } };

      expect(stableStringify(a)).toBe(stableStringify(b));
    });

    it('ネストしたオブジェクトのキー順も正規化する', () => {
      const a = { chrome: { version: '100', status: 'available' } };
      const b = { chrome: { status: 'available', version: '100' } };

      expect(stableStringify(a)).toBe(stableStringify(b));
    });

    it('内容が異なるオブジェクトは異なる文字列になる', () => {
      expect(stableStringify({ chrome: { version: '100' } })).not.toBe(
        stableStringify({ chrome: { version: '101' } }),
      );
    });
  });

  describe('エッジケース', () => {
    it('配列の順序は保持する', () => {
      expect(stableStringify([1, 2, 3])).toBe('[1,2,3]');
      expect(stableStringify([1, 2, 3])).not.toBe(stableStringify([3, 2, 1]));
    });

    it('null をそのまま文字列化する', () => {
      expect(stableStringify(null)).toBe('null');
    });
  });
});
