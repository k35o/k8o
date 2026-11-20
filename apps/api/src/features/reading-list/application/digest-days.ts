import type {
  ReadingDigestPick,
  ReadingDigestTopic,
} from '@repo/database/schema';
import { formatDate } from '@repo/helpers/date/format';

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
