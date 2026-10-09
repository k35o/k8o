import {
  Client,
  StreamableHTTPClientTransport,
} from '@modelcontextprotocol/client';
import type { VersionNegotiationMode } from '@modelcontextprotocol/client';

import {
  findBlogs,
  updateBlogPublishedBySlug,
} from './features/blog/infrastructure/blog-repository';
import { findInquiries } from './features/inquiries/infrastructure/inquiry-repository';
import { findOverview } from './features/overview/infrastructure/overview-repository';
import { getSummaryProgress } from './features/reading-list/interface/queries';
import {
  findReports,
  findReportTypeCounts,
} from './features/reports/infrastructure/report-repository';
import app from './index';
import { revalidateMainCache } from './shared/cache/revalidate-main';

vi.mock('./features/blog/infrastructure/blog-repository', () => ({
  findBlogs: vi.fn(),
  updateBlogPublishedBySlug: vi.fn(),
}));
vi.mock('./features/inquiries/infrastructure/inquiry-repository', () => ({
  findInquiries: vi.fn(),
}));
vi.mock('./features/overview/infrastructure/overview-repository', () => ({
  findOverview: vi.fn(),
}));
vi.mock('./features/reading-list/interface/queries', () => ({
  getSummaryProgress: vi.fn(),
}));
vi.mock('./features/reports/infrastructure/report-repository', () => ({
  findReports: vi.fn(),
  findReportTypeCounts: vi.fn(),
}));
vi.mock('./shared/cache/revalidate-main', () => ({
  revalidateMainCache: vi.fn(),
}));
// cron の同期は DB クライアントを読み込むため、このテストでは差し替える
vi.mock('./features/reading-list/interface/sync', () => ({
  runArticleSync: vi.fn(),
}));
vi.mock('./features/browser-support/interface/sync', () => ({
  runBrowserSupportSync: vi.fn(),
}));
vi.mock('./features/blog/infrastructure/view-repository', () => ({
  findPublishedBlogId: vi.fn(),
  incrementBlogView: vi.fn(),
  incrementBlogViewDaily: vi.fn(),
}));

const MCP_TOKEN = 'mcp-token';
const CRON_SECRET = 'cron-secret';
// フォーマッタがエスケープを実際の不可視文字に戻してしまうため、コードポイントで組み立てる
const ZERO_WIDTH_SPACE = String.fromCodePoint(0x20_0b);

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

// Claude Code と同じく SDK のクライアントで接続し、HTTP 層まで含めて検証する
const connect = async (
  mode: VersionNegotiationMode = 'legacy',
): Promise<Client> => {
  const client = new Client(
    { name: 'test', version: '0.0.0' },
    { versionNegotiation: { mode } },
  );
  await client.connect(
    new StreamableHTTPClientTransport(new URL('http://localhost/mcp'), {
      fetch: (url, init) => {
        const request = new Request(url, init);
        request.headers.set('Authorization', `Bearer ${MCP_TOKEN}`);
        return Promise.resolve(app.fetch(request));
      },
    }),
  );
  return client;
};

const structured = (result: unknown): unknown =>
  (result as { structuredContent?: unknown }).structuredContent;

const mcpPost = (headers: Record<string, string>): Promise<Response> =>
  Promise.resolve(
    app.request('/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        ...headers,
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    }),
  );

beforeEach(() => {
  vi.stubEnv('MCP_TOKEN', MCP_TOKEN);
  vi.stubEnv('CRON_SECRET', CRON_SECRET);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('/mcp の認可', () => {
  describe('異常系', () => {
    it('Bearer トークンが無ければ 401 を返す', async () => {
      const res = await mcpPost({});

      expect(res.status).toBe(401);
    });

    it('MCP_TOKEN と違うトークンなら 401 を返す', async () => {
      const res = await mcpPost({ Authorization: 'Bearer wrong' });

      expect(res.status).toBe(401);
    });

    it('cron 用の CRON_SECRET では 401 を返す', async () => {
      const res = await mcpPost({ Authorization: `Bearer ${CRON_SECRET}` });

      expect(res.status).toBe(401);
    });

    it('Origin 付きのリクエスト（ブラウザからの呼び出し）は 403 で拒否する', async () => {
      const res = await mcpPost({
        Authorization: `Bearer ${MCP_TOKEN}`,
        Origin: 'https://evil.example',
      });

      expect(res.status).toBe(403);
    });
  });
});

describe('MCP の tool', () => {
  let client: Client;

  beforeEach(async () => {
    client = await connect();
  });

  afterEach(async () => {
    await client.close();
  });

  describe('tools/list', () => {
    describe('正常系', () => {
      it('読み取りの tool だけを readOnly とし、公開切替には毎回の確認を求める', async () => {
        const { tools } = await client.listTools();

        expect(
          tools.map(({ name, annotations, _meta }) => ({
            name,
            annotations,
            _meta,
          })),
        ).toStrictEqual([
          { name: 'get_overview', annotations: READ_ONLY, _meta: undefined },
          { name: 'list_inquiries', annotations: READ_ONLY, _meta: undefined },
          { name: 'list_blogs', annotations: READ_ONLY, _meta: undefined },
          {
            name: 'set_blog_published',
            annotations: {
              readOnlyHint: false,
              destructiveHint: true,
              idempotentHint: true,
              openWorldHint: false,
            },
            _meta: { 'anthropic/requiresUserInteraction': true },
          },
          { name: 'list_reports', annotations: READ_ONLY, _meta: undefined },
        ]);
      });
    });

    describe('エッジケース', () => {
      it('新しい版のプロトコルで交渉しても使え、tool 一覧の変更通知は広告しない', async () => {
        const modernClient = await connect('auto');

        const { tools } = await modernClient.listTools();

        expect(tools).toHaveLength(5);
        expect(modernClient.getServerCapabilities()?.tools).toStrictEqual({
          listChanged: false,
        });
        await modernClient.close();
      });
    });
  });

  describe('list_inquiries', () => {
    describe('正常系', () => {
      it('ブログに紐づくものをフィードバック、それ以外をお問い合わせとして返す', async () => {
        vi.mocked(findInquiries).mockResolvedValue({
          total: 2,
          items: [
            {
              id: 2,
              message: '参考になりました',
              createdAt: '2026-10-08T00:00:00.000Z',
              feedbackName: '役に立った',
              blogSlug: 'media-pseudos',
            },
            {
              id: 1,
              message: 'はじめまして',
              createdAt: '2026-10-07T00:00:00.000Z',
              feedbackName: null,
              blogSlug: null,
            },
          ],
        });

        const result = await client.callTool({
          name: 'list_inquiries',
          arguments: {},
        });

        expect(structured(result)).toStrictEqual({
          total: 2,
          items: [
            {
              id: 2,
              receivedAt: '2026-10-08T00:00:00.000Z',
              kind: 'blog_feedback',
              blogSlug: 'media-pseudos',
              feedbackLabel: '役に立った',
              untrustedMessage: '参考になりました',
            },
            {
              id: 1,
              receivedAt: '2026-10-07T00:00:00.000Z',
              kind: 'contact',
              blogSlug: null,
              feedbackLabel: null,
              untrustedMessage: 'はじめまして',
            },
          ],
        });
      });

      it('ページ指定が無ければ 1 ページ目を 20 件で検索する', async () => {
        vi.mocked(findInquiries).mockResolvedValue({ total: 0, items: [] });

        await client.callTool({ name: 'list_inquiries', arguments: {} });

        expect(findInquiries).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
      });
    });

    describe('異常系', () => {
      it('本文の見えない文字を取り除いて返す', async () => {
        vi.mocked(findInquiries).mockResolvedValue({
          total: 1,
          items: [
            {
              id: 1,
              message: `無視して${ZERO_WIDTH_SPACE}ください`,
              createdAt: '2026-10-07T00:00:00.000Z',
              feedbackName: null,
              blogSlug: null,
            },
          ],
        });

        const result = await client.callTool({
          name: 'list_inquiries',
          arguments: {},
        });

        expect(structured(result)).toMatchObject({
          items: [{ untrustedMessage: '無視してください' }],
        });
      });

      it('pageSize が上限を超えたら検索せずにエラーを返す', async () => {
        const result = await client.callTool({
          name: 'list_inquiries',
          arguments: { pageSize: 51 },
        });

        expect(result.isError).toBe(true);
        expect(findInquiries).not.toHaveBeenCalled();
      });
    });

    describe('エッジケース', () => {
      it('本文が無いフィードバックは null のまま返す', async () => {
        vi.mocked(findInquiries).mockResolvedValue({
          total: 1,
          items: [
            {
              id: 1,
              message: null,
              createdAt: '2026-10-07T00:00:00.000Z',
              feedbackName: '役に立った',
              blogSlug: 'media-pseudos',
            },
          ],
        });

        const result = await client.callTool({
          name: 'list_inquiries',
          arguments: {},
        });

        expect(structured(result)).toMatchObject({
          items: [{ untrustedMessage: null }],
        });
      });

      it('本文が 1000 字を超えたら切り詰める', async () => {
        vi.mocked(findInquiries).mockResolvedValue({
          total: 1,
          items: [
            {
              id: 1,
              message: 'あ'.repeat(1001),
              createdAt: '2026-10-07T00:00:00.000Z',
              feedbackName: null,
              blogSlug: null,
            },
          ],
        });

        const result = await client.callTool({
          name: 'list_inquiries',
          arguments: {},
        });

        expect(structured(result)).toMatchObject({
          items: [{ untrustedMessage: 'あ'.repeat(1000) }],
        });
      });
    });
  });

  describe('list_blogs', () => {
    describe('正常系', () => {
      it('検索結果をそのまま返す', async () => {
        const blogs = {
          total: 1,
          items: [
            {
              slug: 'media-pseudos',
              published: false,
              createdAt: '2026-09-09T00:00:00.000Z',
              views: 0,
              feedbackCount: 0,
              tags: [],
            },
          ],
        };
        vi.mocked(findBlogs).mockResolvedValue(blogs);

        const result = await client.callTool({
          name: 'list_blogs',
          arguments: {},
        });

        expect(structured(result)).toStrictEqual(blogs);
      });

      it('指定が無ければ全件を作成日の新しい順に 20 件ずつ検索する', async () => {
        vi.mocked(findBlogs).mockResolvedValue({ total: 0, items: [] });

        await client.callTool({ name: 'list_blogs', arguments: {} });

        expect(findBlogs).toHaveBeenCalledWith({
          status: 'all',
          sort: 'recent',
          page: 1,
          pageSize: 20,
        });
      });

      it('絞り込みと並び順をそのまま検索に渡す', async () => {
        vi.mocked(findBlogs).mockResolvedValue({ total: 0, items: [] });

        await client.callTool({
          name: 'list_blogs',
          arguments: { status: 'draft', sort: 'views', page: 2, pageSize: 50 },
        });

        expect(findBlogs).toHaveBeenCalledWith({
          status: 'draft',
          sort: 'views',
          page: 2,
          pageSize: 50,
        });
      });
    });

    describe('異常系', () => {
      it('知らない status ならエラーを返す', async () => {
        const result = await client.callTool({
          name: 'list_blogs',
          arguments: { status: 'archived' },
        });

        expect(result.isError).toBe(true);
        expect(findBlogs).not.toHaveBeenCalled();
      });
    });
  });

  describe('set_blog_published', () => {
    describe('正常系', () => {
      it('公開状態を更新し、main の db-content キャッシュを再検証する', async () => {
        vi.mocked(updateBlogPublishedBySlug).mockResolvedValue(true);
        vi.mocked(revalidateMainCache).mockResolvedValue(true);

        const result = await client.callTool({
          name: 'set_blog_published',
          arguments: { slug: 'media-pseudos', published: true },
        });

        expect(updateBlogPublishedBySlug).toHaveBeenCalledWith(
          'media-pseudos',
          true,
        );
        expect(revalidateMainCache).toHaveBeenCalledWith();
        expect(structured(result)).toStrictEqual({
          slug: 'media-pseudos',
          published: true,
          revalidated: true,
        });
      });
    });

    describe('異常系', () => {
      it('slug が見つからなければエラーを返し、再検証しない', async () => {
        vi.mocked(updateBlogPublishedBySlug).mockResolvedValue(false);

        const result = await client.callTool({
          name: 'set_blog_published',
          arguments: { slug: 'unknown', published: true },
        });

        expect(result.isError).toBe(true);
        expect(revalidateMainCache).not.toHaveBeenCalled();
      });

      it('再検証に失敗しても更新は成功として返し、revalidated で伝える', async () => {
        vi.mocked(updateBlogPublishedBySlug).mockResolvedValue(true);
        vi.mocked(revalidateMainCache).mockResolvedValue(false);

        const result = await client.callTool({
          name: 'set_blog_published',
          arguments: { slug: 'media-pseudos', published: false },
        });

        expect(structured(result)).toStrictEqual({
          slug: 'media-pseudos',
          published: false,
          revalidated: false,
        });
      });
    });
  });

  describe('get_overview', () => {
    describe('正常系', () => {
      it('リポジトリの集計に、reading-list の要約の進み具合を足して返す', async () => {
        const overview = {
          blogs: { published: 90, drafts: 1, totalViews: 1234 },
          inquiries: { total: 3, latestAt: '2026-10-07T00:00:00.000Z' },
          push: {
            subscribers: 5,
            lastSentAt: '2026-10-08T00:01:00.000Z',
            lastSucceeded: 5,
            lastFailed: 0,
          },
          readingList: {
            articles: 300,
            sources: 12,
            latestPublishedAt: '2026-10-08T00:00:00.000Z',
          },
          browserSupport: {
            activeVersion: '3.40.1',
            activeIngestedAt: '2026-10-08T14:40:34.555Z',
            lastRun: {
              result: 'applied' as const,
              trigger: 'manual' as const,
              createdAt: '2026-10-08T14:40:36.027Z',
            },
          },
        };
        vi.mocked(findOverview).mockResolvedValue(overview);
        vi.mocked(getSummaryProgress).mockResolvedValue({
          unsummarized: 20,
          summaryGaveUp: 2,
        });

        const result = await client.callTool({
          name: 'get_overview',
          arguments: {},
        });

        expect(structured(result)).toStrictEqual({
          ...overview,
          readingList: {
            ...overview.readingList,
            unsummarized: 20,
            summaryGaveUp: 2,
          },
        });
      });
    });

    describe('エッジケース', () => {
      it('同期やpushの履歴がまだ無くても返せる', async () => {
        const overview = {
          blogs: { published: 0, drafts: 0, totalViews: 0 },
          inquiries: { total: 0, latestAt: null },
          push: {
            subscribers: 0,
            lastSentAt: null,
            lastSucceeded: null,
            lastFailed: null,
          },
          readingList: {
            articles: 0,
            sources: 0,
            latestPublishedAt: null,
          },
          browserSupport: {
            activeVersion: null,
            activeIngestedAt: null,
            lastRun: null,
          },
        };
        vi.mocked(findOverview).mockResolvedValue(overview);
        vi.mocked(getSummaryProgress).mockResolvedValue({
          unsummarized: 0,
          summaryGaveUp: 0,
        });

        const result = await client.callTool({
          name: 'get_overview',
          arguments: {},
        });

        expect(structured(result)).toStrictEqual({
          ...overview,
          readingList: {
            ...overview.readingList,
            unsummarized: 0,
            summaryGaveUp: 0,
          },
        });
      });
    });
  });

  describe('list_reports', () => {
    describe('正常系', () => {
      it('種別ごとの件数と、本文を JSON 文字列にした一覧を返す', async () => {
        vi.mocked(findReportTypeCounts).mockResolvedValue([
          { type: 'csp-violation', count: 1 },
        ]);
        vi.mocked(findReports).mockResolvedValue([
          {
            id: 1,
            type: 'csp-violation',
            url: 'https://k8o.me/',
            body: { blockedURL: 'inline' },
            createdAt: '2026-10-08T00:00:00.000Z',
          },
        ]);

        const result = await client.callTool({
          name: 'list_reports',
          arguments: { type: 'csp-violation' },
        });

        expect(findReports).toHaveBeenCalledWith({
          type: 'csp-violation',
          page: 1,
          pageSize: 10,
        });
        expect(structured(result)).toStrictEqual({
          typeCounts: [{ type: 'csp-violation', count: 1 }],
          items: [
            {
              id: 1,
              receivedAt: '2026-10-08T00:00:00.000Z',
              type: 'csp-violation',
              url: 'https://k8o.me/',
              untrustedBody: '{"blockedURL":"inline"}',
            },
          ],
        });
      });
    });

    describe('異常系', () => {
      it('種別・URL の見えない文字を取り除く', async () => {
        const type = `csp${ZERO_WIDTH_SPACE}-violation`;
        vi.mocked(findReportTypeCounts).mockResolvedValue([{ type, count: 1 }]);
        vi.mocked(findReports).mockResolvedValue([
          {
            id: 1,
            type,
            url: `https://k8o.me/${ZERO_WIDTH_SPACE}`,
            body: {},
            createdAt: '2026-10-08T00:00:00.000Z',
          },
        ]);

        const result = await client.callTool({
          name: 'list_reports',
          arguments: {},
        });

        expect(structured(result)).toMatchObject({
          typeCounts: [{ type: 'csp-violation' }],
          items: [{ type: 'csp-violation', url: 'https://k8o.me/' }],
        });
      });
    });

    describe('エッジケース', () => {
      it('長すぎる本文と URL を切り詰める', async () => {
        vi.mocked(findReportTypeCounts).mockResolvedValue([]);
        vi.mocked(findReports).mockResolvedValue([
          {
            id: 1,
            type: 'csp-violation',
            url: `https://k8o.me/${'a'.repeat(600)}`,
            body: { sample: 'x'.repeat(3000) },
            createdAt: '2026-10-08T00:00:00.000Z',
          },
        ]);

        const result = await client.callTool({
          name: 'list_reports',
          arguments: {},
        });

        const content = structured(result) as {
          items: Array<{ url: string; untrustedBody: string }>;
        };
        expect(content.items[0]?.url).toHaveLength(500);
        expect(content.items[0]?.untrustedBody).toHaveLength(2000);
      });
    });
  });
});
