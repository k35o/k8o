import { runBrowserSupportSync } from './features/browser-support/interface/sync';
import type { SyncSummary } from './features/browser-support/interface/sync';
import { runArticleSync } from './features/reading-list/interface/sync';
import app from './index';

vi.mock('./features/reading-list/interface/sync', () => ({
  runArticleSync: vi.fn(),
}));
vi.mock('./features/browser-support/interface/sync', () => ({
  runBrowserSupportSync: vi.fn(),
}));
// MCP の tool は DB クライアントを読み込むため、cron のテストでは差し替える
vi.mock('./mcp', () => ({
  mcpHandler: { fetch: vi.fn() },
}));
vi.mock('./features/blog/infrastructure/view-repository', () => ({
  findPublishedBlogId: vi.fn(),
  incrementBlogView: vi.fn(),
  incrementBlogViewDaily: vi.fn(),
}));

const CRON_SECRET = 'cron-secret';

const cronRequest = (path: string, authorization?: string): Promise<Response> =>
  Promise.resolve(
    app.request(path, {
      headers:
        authorization === undefined ? {} : { Authorization: authorization },
    }),
  );

const articleSummary = {
  newArticles: 2,
  updatedArticles: 1,
  enrichedArticles: 0,
  summarizedArticles: 3,
  failedSummaries: 1,
  summaryAborted: false,
  failedSources: [],
};

const browserSupportSummary: SyncSummary = {
  result: 'applied',
  upstreamVersion: '3.40.1',
  newlyCount: 0,
  widelyCount: 0,
  statusChangeCount: 0,
  detail: null,
};

describe('cron ルート', () => {
  beforeEach(() => {
    vi.stubEnv('CRON_SECRET', CRON_SECRET);
    vi.mocked(runArticleSync).mockResolvedValue(articleSummary);
    vi.mocked(runBrowserSupportSync).mockResolvedValue(browserSupportSummary);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('認可', () => {
    it.each(['/cron/sync-articles', '/cron/sync-browser-support'])(
      '%s は Authorization が無ければ 401 を返し同期しない',
      async (path) => {
        const res = await cronRequest(path);

        expect(res.status).toBe(401);
        await expect(res.json()).resolves.toStrictEqual({ ok: false });
        expect(runArticleSync).not.toHaveBeenCalled();
        expect(runBrowserSupportSync).not.toHaveBeenCalled();
      },
    );

    it.each(['/cron/sync-articles', '/cron/sync-browser-support'])(
      '%s は CRON_SECRET と違うトークンなら 401 を返す',
      async (path) => {
        const res = await cronRequest(path, 'Bearer wrong');

        expect(res.status).toBe(401);
      },
    );

    it('MCP 用の MCP_TOKEN では 401 を返す', async () => {
      vi.stubEnv('MCP_TOKEN', 'mcp-token');

      const res = await cronRequest('/cron/sync-articles', 'Bearer mcp-token');

      expect(res.status).toBe(401);
    });
  });

  describe('sync-articles', () => {
    it('同期結果を返し、失敗ソースが無ければ ok にする', async () => {
      const res = await cronRequest(
        '/cron/sync-articles',
        `Bearer ${CRON_SECRET}`,
      );

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toStrictEqual({
        ok: true,
        ...articleSummary,
      });
    });

    it('失敗したソースがあれば 200 のまま ok を false にする', async () => {
      vi.mocked(runArticleSync).mockResolvedValue({
        ...articleSummary,
        failedSources: ['example'],
      });

      const res = await cronRequest(
        '/cron/sync-articles',
        `Bearer ${CRON_SECRET}`,
      );

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toMatchObject({ ok: false });
    });

    it('要約を途中で打ち切ったら 200 のまま ok を false にする', async () => {
      vi.mocked(runArticleSync).mockResolvedValue({
        ...articleSummary,
        summaryAborted: true,
      });

      const res = await cronRequest(
        '/cron/sync-articles',
        `Bearer ${CRON_SECRET}`,
      );

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toMatchObject({ ok: false });
    });

    it('同期が例外を投げたら 500 を返す', async () => {
      vi.mocked(runArticleSync).mockRejectedValue(new Error('boom'));

      const res = await cronRequest(
        '/cron/sync-articles',
        `Bearer ${CRON_SECRET}`,
      );

      expect(res.status).toBe(500);
    });
  });

  describe('sync-browser-support', () => {
    it.each([
      ['', 'cron', false],
      ['?trigger=monitor', 'monitor', false],
      ['?trigger=manual&force=true', 'manual', true],
      ['?trigger=unknown&force=1', 'cron', false],
    ])(
      'クエリ "%s" は trigger=%s, force=%s で同期する',
      async (query, trigger, force) => {
        const res = await cronRequest(
          `/cron/sync-browser-support${query}`,
          `Bearer ${CRON_SECRET}`,
        );

        expect(res.status).toBe(200);
        expect(runBrowserSupportSync).toHaveBeenCalledWith(trigger, { force });
      },
    );

    it.each(['fetch_failed', 'validation_failed', 'db_failed'] as const)(
      '結果が %s なら 500 を返す',
      async (result) => {
        vi.mocked(runBrowserSupportSync).mockResolvedValue({
          ...browserSupportSummary,
          result,
        });

        const res = await cronRequest(
          '/cron/sync-browser-support',
          `Bearer ${CRON_SECRET}`,
        );

        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toMatchObject({ ok: false, result });
      },
    );

    it.each(['applied', 'noop', 'skipped_major'] as const)(
      '結果が %s なら失敗として扱わない',
      async (result) => {
        vi.mocked(runBrowserSupportSync).mockResolvedValue({
          ...browserSupportSummary,
          result,
        });

        const res = await cronRequest(
          '/cron/sync-browser-support',
          `Bearer ${CRON_SECRET}`,
        );

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toMatchObject({ ok: true, result });
      },
    );

    it('同期が例外を投げたら 500 を返す', async () => {
      vi.mocked(runBrowserSupportSync).mockRejectedValue(new Error('boom'));

      const res = await cronRequest(
        '/cron/sync-browser-support',
        `Bearer ${CRON_SECRET}`,
      );

      expect(res.status).toBe(500);
      await expect(res.json()).resolves.toStrictEqual({
        ok: false,
        error: 'sync failed',
      });
    });
  });
});
