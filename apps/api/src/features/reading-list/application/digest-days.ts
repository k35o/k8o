import type {
  ReadingDigestKind,
  ReadingDigestPick,
  ReadingDigestTopic,
} from '@repo/database/schema';
import { formatDate } from '@repo/helpers/date/format';

import type { ReadingDigest } from '../infrastructure/digest-repository';
import type { ReadingListArticle } from '../infrastructure/reading-list-repository';

export type DigestDraft = {
  overview: string;
  picks: ReadingDigestPick[];
  topics: ReadingDigestTopic[];
};

export type DayArticles<Article extends { id: number; publishedAt: string }> = {
  // 日本時間の YYYY-MM-DD
  date: string;
  articles: Article[];
};

// 読む人の 1 日に合わせ、日付は日本時間で区切る
export const digestDateOf = (publishedAt: string): string =>
  formatDate(new Date(publishedAt), 'yyyy-MM-dd');

// 新しい日から並べる。渡す記事は新しい順であること
export const groupByDigestDate = <
  Article extends { id: number; publishedAt: string },
>(
  articles: Article[],
): Array<DayArticles<Article>> =>
  [...Map.groupBy(articles, ({ publishedAt }) => digestDateOf(publishedAt))]
    .map(([date, dayArticles]) => ({ date, articles: dayArticles }))
    .toSorted((a, b) => b.date.localeCompare(a.date));

export const articleKeyOf = (articleIds: number[]): string =>
  articleIds.toSorted((a, b) => a - b).join(',');

const UNTITLED_HEADLINE = 'この日の記事';
const REST_HEADLINE = 'そのほかの記事';
const MAX_OVERVIEW_CHARS = 300;
const MAX_REASON_CHARS = 160;
const MAX_HEADLINE_CHARS = 120;
const MAX_PICKS = 3;

const oneLine = (text: string): string => text.replaceAll(/\s+/gu, ' ').trim();

// 生成したまとめを、その日の記事だけを 1 回ずつ指す形に整える。その日に無い id と、先に取られた id は
// 捨て、見てほしい記事にも話題にも入らなかった記事は最後の話題にまとめる。全体像が使えないときと、
// 指す記事が 1 つも残らないときは null
export const normalizeDigest = (
  draft: DigestDraft,
  dayArticleIds: number[],
): DigestDraft | null => {
  const overview = oneLine(draft.overview);
  if (overview === '' || overview.length > MAX_OVERVIEW_CHARS) {
    return null;
  }

  const remaining = new Set(dayArticleIds);
  const picks: ReadingDigestPick[] = [];
  for (const pick of draft.picks) {
    const reason = oneLine(pick.reason);
    if (
      picks.length < MAX_PICKS &&
      reason !== '' &&
      reason.length <= MAX_REASON_CHARS &&
      remaining.delete(pick.articleId)
    ) {
      picks.push({ articleId: pick.articleId, reason });
    }
  }

  const topics: ReadingDigestTopic[] = [];
  for (const topic of draft.topics) {
    const headline = oneLine(topic.headline);
    if (headline === '' || headline.length > MAX_HEADLINE_CHARS) {
      continue;
    }
    const articleIds = topic.articleIds.filter((id) => remaining.delete(id));
    if (articleIds.length > 0) {
      topics.push({ kind: topic.kind, headline, articleIds });
    }
  }
  if (picks.length === 0 && topics.length === 0) {
    return null;
  }
  if (remaining.size > 0) {
    topics.push({
      kind: 'other',
      headline: REST_HEADLINE,
      articleIds: [...remaining],
    });
  }
  return { overview, picks, topics };
};

export type ReadingDayArticle = {
  id: number;
  title: string;
  url: string;
  publishedAt: string;
  imageUrl: string | null;
  // 要約があれば要約、無ければ元の記事の説明
  text: string | null;
  sourceTitle: string;
};

export type ReadingDay = {
  // 日本時間の YYYY-MM-DD
  date: string;
  articleCount: number;
  // まとめをまだ作っていない日は null
  overview: string | null;
  picks: Array<{ article: ReadingDayArticle; reason: string }>;
  topics: Array<{
    kind: ReadingDigestKind;
    headline: string;
    articles: ReadingDayArticle[];
  }>;
};

const toDayArticle = (article: ReadingListArticle): ReadingDayArticle => ({
  id: article.id,
  title: article.title,
  url: article.url,
  publishedAt: article.publishedAt,
  imageUrl: article.imageUrl,
  text: article.summary ?? article.description,
  sourceTitle: article.source.title,
});

// 記事を日ごとに分け、その日のまとめの、見てほしい記事と話題に入れる。新しい順の記事を渡すと、新しい日
// から並ぶ。まとめをまだ作っていない日は、その日の記事を 1 つの話題にする。まとめを作ったあとに増えた
// 記事は、最後の話題にまとめる
export const toReadingDays = (
  articles: ReadingListArticle[],
  digests: ReadingDigest[],
): ReadingDay[] => {
  const digestByDate = new Map(digests.map((digest) => [digest.date, digest]));
  return groupByDigestDate(articles).map(({ date, articles: dayArticles }) => {
    const digest = digestByDate.get(date);
    const remaining = new Map(
      dayArticles.map((article) => [article.id, toDayArticle(article)]),
    );
    const take = (id: number): ReadingDayArticle[] => {
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
