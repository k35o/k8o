import {
  gatedServe,
  isOverServeLimit,
  serveWindowStartIso,
  shareServeLimit,
} from './serve-limit';

describe('serve-limit', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('正常系', () => {
    it('上限未満は false、上限到達以上で true', () => {
      expect(isOverServeLimit(29, 30)).toBe(false);
      expect(isOverServeLimit(30, 30)).toBe(true);
      expect(isOverServeLimit(31, 30)).toBe(true);
    });

    it('serveWindowStartIso は now から1時間前の ISO を返す', () => {
      const now = Date.parse('2026-06-23T12:00:00.000Z');
      expect(serveWindowStartIso(now)).toBe('2026-06-23T11:00:00.000Z');
    });

    it('shareServeLimit は正の整数 env を採用する', () => {
      vi.stubEnv('AI_SHARE_SERVE_LIMIT_PER_HOUR', '80');
      expect(shareServeLimit()).toBe(80);
    });
  });

  describe('エッジケース', () => {
    it('env 未設定は既定値 30 にフォールバックする', () => {
      vi.stubEnv('AI_SHARE_SERVE_LIMIT_PER_HOUR', '');
      expect(shareServeLimit()).toBe(30);
    });

    it('不正な env は既定値 30 にフォールバックする', () => {
      vi.stubEnv('AI_SHARE_SERVE_LIMIT_PER_HOUR', 'abc');
      expect(shareServeLimit()).toBe(30);
    });

    it('0 以下の env は既定値 30 にフォールバックする', () => {
      vi.stubEnv('AI_SHARE_SERVE_LIMIT_PER_HOUR', '0');
      expect(shareServeLimit()).toBe(30);
      vi.stubEnv('AI_SHARE_SERVE_LIMIT_PER_HOUR', '-5');
      expect(shareServeLimit()).toBe(30);
    });

    it('小数の env は整数でないため既定値 30 にフォールバックする', () => {
      vi.stubEnv('AI_SHARE_SERVE_LIMIT_PER_HOUR', '10.5');
      expect(shareServeLimit()).toBe(30);
    });
  });
});

describe('gatedServe', () => {
  type CountFn = (input: { sinceIso: string }) => Promise<number>;
  type Over = {
    count?: number | CountFn;
    serveUrl?: string | null;
    recordThrows?: boolean;
    limit?: number;
  };

  // 決定的な依存を組み立てる。呼び出し回数を数えて serve/record の発火を検証する。
  const makeDeps = (over: Over) => {
    let served = 0;
    let recorded = 0;
    const count = over.count ?? 0;
    const countRecentServes: CountFn =
      typeof count === 'function'
        ? count
        : (): Promise<number> => Promise.resolve(count);
    const deps = {
      slug: 'slug-x',
      now: Date.parse('2026-06-23T12:00:00.000Z'),
      limit: over.limit ?? 30,
      countRecentServes,
      serve: (): Promise<string | null> => {
        served += 1;
        return Promise.resolve(
          over.serveUrl === undefined
            ? 'https://served.example'
            : over.serveUrl,
        );
      },
      recordServe: (): Promise<void> => {
        recorded += 1;
        return over.recordThrows === true
          ? Promise.reject(new Error('record boom'))
          : Promise.resolve();
      },
    };
    return {
      deps,
      servedCount: (): number => served,
      recordedCount: (): number => recorded,
    };
  };

  describe('正常系', () => {
    it('上限未満なら serve し、成功時に1回だけ記録して URL を返す', async () => {
      const { deps, servedCount, recordedCount } = makeDeps({ count: 29 });
      const url = await gatedServe(deps);
      expect(url).toBe('https://served.example');
      expect(servedCount()).toBe(1);
      expect(recordedCount()).toBe(1);
    });

    it('countRecentServes は now から1時間前の sinceIso で問い合わせる', async () => {
      let capturedSince = '';
      const { deps } = makeDeps({
        count: (input: { sinceIso: string }): Promise<number> => {
          capturedSince = input.sinceIso;
          return Promise.resolve(0);
        },
      });
      await gatedServe(deps);
      expect(capturedSince).toBe('2026-06-23T11:00:00.000Z');
    });
  });

  describe('異常系', () => {
    it('上限到達なら serve せず（課金させず）記録もせず null を返す', async () => {
      const { deps, servedCount, recordedCount } = makeDeps({ count: 30 });
      const url = await gatedServe(deps);
      expect(url).toBeNull();
      expect(servedCount()).toBe(0);
      expect(recordedCount()).toBe(0);
    });

    it('カウント取得が失敗しても fail-open で serve する', async () => {
      const { deps, servedCount, recordedCount } = makeDeps({
        count: (): Promise<number> => Promise.reject(new Error('db down')),
      });
      const url = await gatedServe(deps);
      expect(url).toBe('https://served.example');
      expect(servedCount()).toBe(1);
      expect(recordedCount()).toBe(1);
    });

    it('記録が失敗しても配信は止めず URL を返す', async () => {
      const { deps, servedCount } = makeDeps({
        count: 0,
        recordThrows: true,
      });
      const url = await gatedServe(deps);
      expect(url).toBe('https://served.example');
      expect(servedCount()).toBe(1);
    });
  });

  describe('エッジケース', () => {
    it('serve が null を返したら記録しない（実配信していないため）', async () => {
      const { deps, recordedCount } = makeDeps({ count: 0, serveUrl: null });
      const url = await gatedServe(deps);
      expect(url).toBeNull();
      expect(recordedCount()).toBe(0);
    });
  });
});
