import { buildRssFeed } from './build-rss';

const baseOptions = {
  title: 'k8o Blog',
  description: 'ブログの説明',
  feedUrl: 'https://k8o.me/blog/feed',
  siteUrl: 'https://k8o.me/blog',
};

describe('buildRssFeed', () => {
  describe('正常系', () => {
    it('channel と item を含む RSS 2.0 の XML を組み立てる', () => {
      const xml = buildRssFeed({
        ...baseOptions,
        items: [
          {
            title: '記事タイトル',
            description: '記事の説明',
            url: 'https://k8o.me/blog/a',
            guid: 'https://k8o.me/blog/a',
            date: '2026-01-02T03:04:05.000Z',
            categories: ['CSS', 'HTML'],
          },
        ],
      });

      expect(xml).toBe(
        '<?xml version="1.0" encoding="UTF-8"?>' +
          '<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">' +
          '<channel>' +
          '<title>k8o Blog</title>' +
          '<description>ブログの説明</description>' +
          '<link>https://k8o.me/blog</link>' +
          '<atom:link href="https://k8o.me/blog/feed" rel="self" type="application/rss+xml"/>' +
          '<language>ja</language>' +
          '<item>' +
          '<title>記事タイトル</title>' +
          '<description>記事の説明</description>' +
          '<link>https://k8o.me/blog/a</link>' +
          '<guid isPermaLink="false">https://k8o.me/blog/a</guid>' +
          '<category>CSS</category>' +
          '<category>HTML</category>' +
          '<pubDate>Fri, 02 Jan 2026 03:04:05 GMT</pubDate>' +
          '</item>' +
          '</channel>' +
          '</rss>',
      );
    });

    it('guid 未指定の item は url を guid にする', () => {
      const xml = buildRssFeed({
        ...baseOptions,
        items: [
          {
            title: 't',
            description: 'd',
            url: 'https://k8o.me/blog/a',
            date: new Date('2026-01-02T03:04:05.000Z'),
            categories: [],
          },
        ],
      });

      expect(xml).toContain(
        '<guid isPermaLink="false">https://k8o.me/blog/a</guid>',
      );
      expect(xml).toContain('<pubDate>Fri, 02 Jan 2026 03:04:05 GMT</pubDate>');
    });

    it('item が無くても channel だけの XML を返す', () => {
      const xml = buildRssFeed({ ...baseOptions, items: [] });

      expect(xml).toContain('<channel>');
      expect(xml).not.toContain('<item>');
    });
  });

  describe('エッジケース', () => {
    it('descriptionが空のitemはdescription要素ごと省く', () => {
      const xml = buildRssFeed({
        ...baseOptions,
        items: [
          {
            title: 't',
            description: '',
            url: 'https://k8o.me/blog/a',
            date: '2026-01-02T03:04:05.000Z',
            categories: [],
          },
        ],
      });

      expect(xml).not.toContain('<description></description>');
    });

    it('XML 特殊文字をエスケープする', () => {
      const xml = buildRssFeed({
        ...baseOptions,
        description: 'A & B <tag> "quote"',
        items: [
          {
            title: 'タイトル & <b>',
            description: '説明 & 詳細',
            url: 'https://k8o.me/blog/a?x=1&y=2',
            date: '2026-01-02T03:04:05.000Z',
            categories: ['C&C++'],
          },
        ],
      });

      expect(xml).toContain(
        '<description>A &amp; B &lt;tag&gt; &quot;quote&quot;</description>',
      );
      expect(xml).toContain('<title>タイトル &amp; &lt;b&gt;</title>');
      expect(xml).toContain('<link>https://k8o.me/blog/a?x=1&amp;y=2</link>');
      expect(xml).toContain('<category>C&amp;C++</category>');
      expect(xml).not.toContain('<b>');
    });
  });
});
