import { safeFetch } from '@repo/helpers/url/safe-fetch';
import { describe, expect, it, vi } from 'vitest';

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

    it('項目の本文（content:encoded か description）から HTML を外し、空白を詰めて text にする', async () => {
      vi.mocked(safeFetch).mockResolvedValue(
        feedResponse(
          [
            '<?xml version="1.0"?><rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><title>t</title>',
            '<item><title>2.1.331</title><link>https://code.claude.com/docs/en/changelog#2-1-331</link>',
            '<pubDate>Mon, 23 Nov 2026 21:40:51 GMT</pubDate>',
            '<content:encoded><![CDATA[<p><strong>Added</strong></p> <ul> <li>Added <code>oidc</code> support</li> <li>Fixed a bug</li></ul>]]></content:encoded></item>',
            '<item><title>Release notes</title><link>https://platform.claude.com/docs/en/release-notes/overview#linked-billing</link>',
            '<pubDate>Tue, 17 Nov 2026 00:00:00 GMT</pubDate>',
            '<description><![CDATA[ <ul> <li>We launched <a href="https://platform.claude.com/docs">Linked billing</a> in beta.</li> </ul> ]]></description></item>',
            '</channel></rss>',
          ].join(''),
        ),
      );

      const items = await fetchFeedItems('https://example.com/feed');

      expect(items).toStrictEqual([
        {
          title: '2.1.331',
          link: 'https://code.claude.com/docs/en/changelog#2-1-331',
          publishedAt: '2026-11-23T21:40:51.000Z',
          text: 'Added Added oidc support Fixed a bug',
        },
        {
          title: 'Release notes',
          link: 'https://platform.claude.com/docs/en/release-notes/overview#linked-billing',
          publishedAt: '2026-11-17T00:00:00.000Z',
          text: 'We launched Linked billing in beta.',
        },
      ]);
    });

    it('応答しないフィードで関数の上限を食い潰さないよう、タイムアウトを付けて取得する', async () => {
      vi.mocked(safeFetch).mockResolvedValue(
        feedResponse(
          '<rss version="2.0"><channel><title>t</title></channel></rss>',
        ),
      );

      await fetchFeedItems('https://example.com/feed');

      expect(safeFetch).toHaveBeenCalledWith('https://example.com/feed', {
        signal: expect.any(AbortSignal),
      });
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
