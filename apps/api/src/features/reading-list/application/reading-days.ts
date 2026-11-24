import type { ReadingDigestKind } from '@repo/database/schema';

import type { ReadingDigest } from '../infrastructure/digest-repository';
import type { ReadingArticle } from '../infrastructure/reading-list-repository';
import { groupByReadingDate } from './reading-date';

export type ReadingDay = {
  // 日本時間の YYYY-MM-DD
  date: string;
  articleCount: number;
  // まとめをまだ作っていない日は null
  overview: string | null;
  picks: Array<{ article: ReadingArticle; reason: string }>;
  topics: Array<{
    kind: ReadingDigestKind;
    headline: string;
    articles: ReadingArticle[];
  }>;
};

const UNTITLED_HEADLINE = 'この日の記事';
const REST_HEADLINE = 'そのほかの記事';

// 新しい順の記事を日ごとに分け、その日のまとめの見てほしい記事と話題に入れる。まとめの無い日の記事と、
// まとめのどこにも入らなかった記事は、最後の話題にまとめる
export const toReadingDays = (
  articles: readonly ReadingArticle[],
  digests: readonly ReadingDigest[],
): ReadingDay[] => {
  const digestByDate = new Map(digests.map((digest) => [digest.date, digest]));
  return groupByReadingDate(articles).map(({ date, articles: dayArticles }) => {
    const digest = digestByDate.get(date);
    const remaining = new Map(
      dayArticles.map((article) => [article.id, article]),
    );
    const take = (id: number): ReadingArticle[] => {
      const article = remaining.get(id);
      remaining.delete(id);
      return article === undefined ? [] : [article];
    };

    const picks = (digest?.picks ?? []).flatMap(({ articleId, reason }) =>
      take(articleId).map((article) => ({ article, reason })),
    );
    const topics: ReadingDay['topics'] = (digest?.topics ?? []).flatMap(
      ({ kind, headline, articleIds }) => {
        const topicArticles = articleIds.flatMap(take);
        return topicArticles.length === 0
          ? []
          : [{ kind, headline, articles: topicArticles }];
      },
    );
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
