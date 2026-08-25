import { safeFetch } from '@repo/helpers/url/safe-fetch';
import Parser from 'rss-parser';

const parser = new Parser();

function sanitizeFeedDates(xml: string): string {
  return xml.replaceAll(
    /<(updated|published)>([^<]+)<\/\1>/gu,
    (match: string, tag: string, value: string) => {
      if (Number.isNaN(new Date(value).getTime())) {
        return `<${tag}></${tag}>`;
      }
      return match;
    },
  );
}

export type FeedItem = {
  title: string | undefined;
  link: string | undefined;
  // rss-parser はパース不能な pubDate のとき isoDate を設定しないため、
  // 生文字列が混ざりうる。保存前の検証・正規化は呼び出し側で行う。
  publishedAt: string | undefined;
};

export async function fetchFeedItems(url: string): Promise<FeedItem[]> {
  // SSRF 対策: 公開 https URL のみ許可し、リダイレクト先も都度検証する
  const response = await safeFetch(url);
  if (!response.ok) {
    throw new Error(
      `フィード取得失敗: ${response.status} ${response.statusText}`,
    );
  }
  const xml = await response.text();
  const feed = await parser.parseString(sanitizeFeedDates(xml));
  return feed.items.map((item) => ({
    title: item.title,
    link: item.link,
    publishedAt: item.isoDate ?? item.pubDate,
  }));
}
