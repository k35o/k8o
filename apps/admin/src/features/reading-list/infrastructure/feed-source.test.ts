import { safeFetch } from '@repo/helpers/url/safe-fetch';

import { fetchFeedItems } from './feed-source';

vi.mock('@repo/helpers/url/safe-fetch', () => ({
  safeFetch: vi.fn(),
}));

const feedResponse = (xml: string): Response =>
  ({
    ok: true,
    status: 200,
    statusText: 'OK',
    text: () => Promise.resolve(xml),
  }) as unknown as Response;

describe('fetchFeedItems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('正常系', () => {
    it('RSSのitemをtitle / link / publishedAtへ正規化する', async () => {
      vi.mocked(safeFetch).mockResolvedValue(
        feedResponse(
          [
            '<?xml version="1.0"?><rss version="2.0"><channel><title>t</title>',
            '<item><title>記事</title><link>https://example.com/a</link>',
            '<pubDate>Tue, 10 Mar 2026 09:30:00 GMT</pubDate></item>',
            '</channel></rss>',
          ].join(''),
        ),
      );

      const items = await fetchFeedItems('https://example.com/feed');

      expect(items).toStrictEqual([
        {
          title: '記事',
          link: 'https://example.com/a',
          publishedAt: '2026-03-10T09:30:00.000Z',
        },
      ]);
    });

    it('isoDateが無い（pubDateがパース不能な）itemは生のpubDateをpublishedAtに残す', async () => {
      vi.mocked(safeFetch).mockResolvedValue(
        feedResponse(
          [
            '<?xml version="1.0"?><rss version="2.0"><channel><title>t</title>',
            '<item><title>記事</title><link>https://example.com/a</link>',
            '<pubDate>not a parsable date</pubDate></item>',
            '</channel></rss>',
          ].join(''),
        ),
      );

      const items = await fetchFeedItems('https://example.com/feed');

      // 保存前の検証・スキップは呼び出し側の責務なので、ここでは値を落とさず渡す
      expect(items).toStrictEqual([
        {
          title: '記事',
          link: 'https://example.com/a',
          publishedAt: 'not a parsable date',
        },
      ]);
    });
  });

  describe('異常系', () => {
    it('HTTPエラーのレスポンスはthrowする', async () => {
      vi.mocked(safeFetch).mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        text: () => Promise.resolve(''),
      } as unknown as Response);

      await expect(fetchFeedItems('https://example.com/feed')).rejects.toThrow(
        'フィード取得失敗: 503',
      );
    });
  });

  describe('エッジケース', () => {
    it('不正なAtom日付はsanitizeで空にしてパースを壊さない', async () => {
      vi.mocked(safeFetch).mockResolvedValue(
        feedResponse(
          [
            '<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">',
            '<title>t</title><entry><title>記事</title>',
            '<link href="https://example.com/a"/>',
            '<updated>invalid-date</updated></entry></feed>',
          ].join(''),
        ),
      );

      const items = await fetchFeedItems('https://example.com/feed');

      // 日付は空になり、呼び出し側の検証でスキップされる
      expect(items).toStrictEqual([
        {
          title: '記事',
          link: 'https://example.com/a',
          publishedAt: undefined,
        },
      ]);
    });
  });
});
