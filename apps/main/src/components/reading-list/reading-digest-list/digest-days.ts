import { formatDate } from '@repo/helpers/date/format';

type Article = { id: number; publishedAt: string };

type Digest<Kind extends string> = {
  date: string;
  overview: string;
  picks: ReadonlyArray<{ articleId: number; reason: string }>;
  topics: ReadonlyArray<{
    kind: Kind;
    headline: string;
    articleIds: readonly number[];
  }>;
};

export type DigestPickView<Item> = { article: Item; reason: string };

export type DigestTopicView<Item, Kind extends string> = {
  // other は、話題に分けていない記事のまとまり
  kind: Kind | 'other';
  headline: string;
  articles: Item[];
};

export type DigestDayView<Item, Kind extends string> = {
  // 日本時間の YYYY-MM-DD
  date: string;
  articleCount: number;
  // まとめをまだ作っていない日は null
  overview: string | null;
  picks: Array<DigestPickView<Item>>;
  topics: Array<DigestTopicView<Item, Kind>>;
};

const UNTITLED_HEADLINE = 'この日の記事';
const REST_HEADLINE = 'そのほかの記事';

// 記事を日本時間の日ごとに分け、その日のまとめの、見てほしい記事と話題に振り分ける。新しい順の記事を
// 渡すと、新しい日から並ぶ。まとめをまだ作っていない日は、その日の記事をまとめた話題 1 つにする。
// まとめを作ったあとに増えた記事は、最後の話題にまとめる
export const toDigestDays = <Item extends Article, Kind extends string>(
  articles: readonly Item[],
  digests: ReadonlyArray<Digest<Kind>>,
): Array<DigestDayView<Item, Kind>> => {
  const digestByDate = new Map(digests.map((digest) => [digest.date, digest]));
  return [
    ...Map.groupBy(articles, ({ publishedAt }) =>
      formatDate(new Date(publishedAt), 'yyyy-MM-dd'),
    ),
  ].map(([date, dayArticles]) => {
    const digest = digestByDate.get(date);
    const remaining = new Map(
      dayArticles.map((article) => [article.id, article]),
    );
    const take = (id: number): Item[] => {
      const article = remaining.get(id);
      remaining.delete(id);
      return article === undefined ? [] : [article];
    };

    const picks = (digest?.picks ?? []).flatMap(({ articleId, reason }) =>
      take(articleId).map((article) => ({ article, reason })),
    );
    const topics: Array<DigestTopicView<Item, Kind>> = (
      digest?.topics ?? []
    ).flatMap(({ kind, headline, articleIds }) => {
      const topicArticles = articleIds.flatMap(take);
      return topicArticles.length === 0
        ? []
        : [{ kind, headline, articles: topicArticles }];
    });
    if (remaining.size > 0) {
      topics.push({
        kind: 'other',
        headline:
          picks.length === 0 && topics.length === 0
            ? UNTITLED_HEADLINE
            : REST_HEADLINE,
        articles: [...remaining.values()],
      });
    }
    return {
      date,
      articleCount: dayArticles.length,
      overview: digest?.overview ?? null,
      picks,
      topics,
    };
  });
};
