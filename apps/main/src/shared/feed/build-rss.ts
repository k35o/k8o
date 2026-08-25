type FeedItem = {
  title: string;
  description: string;
  url: string;
  // URL 変更に強い安定した一意 ID。未指定なら url にフォールバックする
  guid?: string;
  date: string | Date;
  categories: readonly string[];
};

type BuildRssFeedOptions = {
  title: string;
  description: string;
  feedUrl: string;
  siteUrl: string;
  items: readonly FeedItem[];
};

const escapeXml = (text: string): string =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const buildItem = (item: FeedItem): string =>
  [
    '<item>',
    `<title>${escapeXml(item.title)}</title>`,
    // 空の description は要素ごと省く（旧rssライブラリと同じ出力）
    ...(item.description === ''
      ? []
      : [`<description>${escapeXml(item.description)}</description>`]),
    `<link>${escapeXml(item.url)}</link>`,
    `<guid isPermaLink="false">${escapeXml(item.guid ?? item.url)}</guid>`,
    ...item.categories.map(
      (category) => `<category>${escapeXml(category)}</category>`,
    ),
    `<pubDate>${new Date(item.date).toUTCString()}</pubDate>`,
    '</item>',
  ].join('');

// blog / slides / reading-list の3つの feed route で共通の RSS 2.0 構築処理。
// 出力を決定的に保つため、任意要素の lastBuildDate / generator は出さない。
export const buildRssFeed = (options: BuildRssFeedOptions): string =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">',
    '<channel>',
    `<title>${escapeXml(options.title)}</title>`,
    `<description>${escapeXml(options.description)}</description>`,
    `<link>${escapeXml(options.siteUrl)}</link>`,
    `<atom:link href="${escapeXml(options.feedUrl)}" rel="self" type="application/rss+xml"/>`,
    '<language>ja</language>',
    ...options.items.map((item) => buildItem(item)),
    '</channel>',
    '</rss>',
  ].join('');
