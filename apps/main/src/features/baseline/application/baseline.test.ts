import {
  computeBaselineMinVersions,
  getBaselineFeatures,
  getFeatureStatus,
  getPlatformFeatures,
  selectBaselineFeatures,
  selectFeatureStatus,
  selectPlatformFeatures,
} from './baseline';
import type { BrowsersLike, FeaturesLike } from './baseline';

const browsersFixture: BrowsersLike = {
  chrome: {
    releases: [
      { version: '120', date: '2024-01-15' },
      { version: '149', date: '2026-06-04' },
      { version: '150', date: '2026-06-30' },
    ],
  },
  firefox: {
    releases: [
      { version: '146', date: '2026-05-01' },
      { version: '150', date: '2026-06-10' },
    ],
  },
  safari: {
    releases: [
      { version: '17.2', date: '2024-01-20' },
      { version: '26', date: '2026-04-01' },
    ],
  },
};

const featuresFixture: FeaturesLike = {
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
      baseline_low_date: '2026-04-01',
      support: { chrome: '149', firefox: '146', safari: '26' },
    },
  },
  'limited-recent': {
    kind: 'feature',
    name: 'Limited Recent',
    // edge は browsersFixture に無く、日付が解決できないケースを兼ねる。
    status: {
      baseline: false,
      support: { chrome: '150', edge: '150', firefox: '150' },
    },
  },
  'limited-old': {
    kind: 'feature',
    name: 'Limited Old',
    status: {
      baseline: false,
      support: { chrome: '120' },
    },
  },
  'moved-entry': {
    kind: 'moved',
    redirect_target: 'widely-feat',
  },
  'split-entry': {
    kind: 'split',
    redirect_targets: ['newly-feat', 'widely-feat'],
  },
  'no-status': {
    kind: 'feature',
    name: 'No Status',
  },
};

// 2026-07-20 UTC。直近1年の境界は 2025-07-20。
const NOW_MS = new Date('2026-07-20T00:00:00Z').getTime();

describe('selectBaselineFeatures', () => {
  describe('正常系', () => {
    it('baseline(newly/widely)のみを日付降順で返す', () => {
      const result = selectBaselineFeatures(featuresFixture);
      expect(result).toStrictEqual([
        {
          featureId: 'newly-feat',
          name: 'Newly Feature',
          status: 'newly',
          date: '2026-04-01',
        },
        {
          featureId: 'widely-feat',
          name: 'Widely Feature',
          status: 'widely',
          date: '2023-07-01',
        },
      ]);
    });

    it('widely は high_date、newly は low_date を採用する', () => {
      const result = selectBaselineFeatures(featuresFixture);
      expect(result.find((f) => f.featureId === 'widely-feat')?.date).toBe(
        '2023-07-01',
      );
      expect(result.find((f) => f.featureId === 'newly-feat')?.date).toBe(
        '2026-04-01',
      );
    });
  });

  describe('異常系・エッジケース', () => {
    it('limited / moved / status 無し は含めない', () => {
      const ids = selectBaselineFeatures(featuresFixture).map(
        (f) => f.featureId,
      );
      expect(ids).not.toContain('limited-recent');
      expect(ids).not.toContain('limited-old');
      expect(ids).not.toContain('moved-entry');
      expect(ids).not.toContain('no-status');
    });
  });
});

describe('selectPlatformFeatures', () => {
  describe('正常系', () => {
    it('baseline全部＋直近1年のlimitedを、直近で動いた日の降順で返す', () => {
      const result = selectPlatformFeatures(
        featuresFixture,
        browsersFixture,
        NOW_MS,
      );
      expect(result.map((f) => f.featureId)).toStrictEqual([
        'limited-recent',
        'newly-feat',
        'widely-feat',
      ]);
    });

    it('limited は baselineDate=null、resolvedDate=最後に対応した日', () => {
      const result = selectPlatformFeatures(
        featuresFixture,
        browsersFixture,
        NOW_MS,
      );
      const limited = result.find((f) => f.featureId === 'limited-recent');
      expect(limited?.status).toBe('limited');
      expect(limited?.baselineDate).toBeNull();
      expect(limited?.resolvedDate).toBe('2026-06-30');
    });

    it('support はコアブラウザ順で、リリース日を解決する', () => {
      const result = selectPlatformFeatures(
        featuresFixture,
        browsersFixture,
        NOW_MS,
      );
      const widely = result.find((f) => f.featureId === 'widely-feat');
      expect(widely?.support).toStrictEqual([
        { browser: 'chrome', version: '120', date: '2024-01-15' },
        { browser: 'firefox', version: '146', date: '2026-05-01' },
        { browser: 'safari', version: '17.2', date: '2024-01-20' },
      ]);
    });
  });

  describe('異常系・エッジケース', () => {
    it('1年より前にしか動いていない limited は除外する', () => {
      const ids = selectPlatformFeatures(
        featuresFixture,
        browsersFixture,
        NOW_MS,
      ).map((f) => f.featureId);
      expect(ids).not.toContain('limited-old');
    });

    it('リリース日が解決できないブラウザは date=null になる', () => {
      const result = selectPlatformFeatures(
        featuresFixture,
        browsersFixture,
        NOW_MS,
      );
      const limited = result.find((f) => f.featureId === 'limited-recent');
      const edge = limited?.support.find((s) => s.browser === 'edge');
      expect(edge).toStrictEqual({
        browser: 'edge',
        version: '150',
        date: null,
      });
    });
  });
});

describe('computeBaselineMinVersions', () => {
  describe('正常系', () => {
    it('baseline機能の対応版の、ブラウザごとの最大値を返す', () => {
      expect(computeBaselineMinVersions(featuresFixture)).toStrictEqual({
        chrome: '149',
        firefox: '146',
        safari: '26',
      });
    });
  });

  describe('異常系・エッジケース', () => {
    it('limited機能はフロア算出に含めない', () => {
      // limited-recent の chrome150 が含まれれば chrome は 150 になるはず。
      expect(computeBaselineMinVersions(featuresFixture).chrome).toBe('149');
    });
  });
});

describe('selectFeatureStatus', () => {
  const lookup = (id: string) =>
    selectFeatureStatus(featuresFixture, browsersFixture, id);

  describe('正常系', () => {
    it('feature を featureId で解決して状態を返す', () => {
      expect(lookup('newly-feat')?.status).toBe('newly');
      expect(lookup('widely-feat')?.status).toBe('widely');
    });

    it('limited は recency フィルタ無しで単体解決できる', () => {
      // limited-old は一覧では除外されるが、単体解決では返る。
      expect(lookup('limited-old')?.status).toBe('limited');
    });
  });

  describe('異常系・エッジケース', () => {
    it('moved は redirect_target を辿って解決する', () => {
      expect(lookup('moved-entry')?.featureId).toBe('widely-feat');
    });

    it('split は redirect_targets の先頭を辿って解決する', () => {
      expect(lookup('split-entry')?.featureId).toBe('newly-feat');
    });

    it('存在しない ID は null を返す', () => {
      expect(lookup('does-not-exist')).toBeNull();
    });
  });
});

// 実際の web-features パッケージに対する不変条件。データ版に依存しない性質のみ検証する。
describe('実データ(web-features)', () => {
  it('getFeatureStatus は split エントリも redirect 解決して返す', () => {
    // single-color-gradients は split -> gradients/conic-gradients。
    expect(getFeatureStatus('single-color-gradients')).not.toBeNull();
    expect(getFeatureStatus('does-not-exist-xyz')).toBeNull();
  });

  it('getBaselineFeatures は newly/widely のみを日付降順で返す', () => {
    const features = getBaselineFeatures();
    expect(features.length).toBeGreaterThan(0);
    for (const f of features) {
      expect(['newly', 'widely']).toContain(f.status);
      expect(f.date).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
    }
    const dates = features.map((f) => f.date);
    expect(dates).toStrictEqual(
      [...dates].toSorted((a, b) => b.localeCompare(a)),
    );
  });

  it('getPlatformFeatures は baseline を包含し limited を追加する', () => {
    const baseline = getBaselineFeatures();
    const platform = getPlatformFeatures(NOW_MS);
    expect(platform.length).toBeGreaterThanOrEqual(baseline.length);
    for (const f of platform) {
      expect(['newly', 'widely', 'limited']).toContain(f.status);
    }
    expect(platform.some((f) => f.status === 'limited')).toBe(true);
  });
});
