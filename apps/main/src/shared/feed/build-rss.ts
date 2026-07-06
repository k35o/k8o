import RSS from 'rss';

type FeedItem = {
  title: string;
  description: string;
  url: string;
  // URL 変更に強い安定した一意 ID。未指定なら rss ライブラリが url にフォールバックする
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

// blog / slides / reading-list の3つの feed route で共通の RSS 構築処理。
export const buildRssFeed = (options: BuildRssFeedOptions): string => {
  const feed = new RSS({
    title: options.title,
    description: options.description,
    feed_url: options.feedUrl,
    site_url: options.siteUrl,
    language: 'ja',
  });

  for (const item of options.items) {
    feed.item({
      title: item.title,
      description: item.description,
      url: item.url,
      guid: item.guid ?? item.url,
      date: item.date,
      categories: [...item.categories],
    });
  }

  return feed.xml();
};
