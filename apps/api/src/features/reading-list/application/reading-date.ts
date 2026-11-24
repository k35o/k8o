import { formatDate } from '@repo/helpers/date/format';

// 読む人の 1 日に合わせ、日付（YYYY-MM-DD）は日本時間で区切る
export const readingDateOf = (at: string): string =>
  formatDate(new Date(at), 'yyyy-MM-dd');

// 新しい日から並べる。日の中の記事は、渡した順のまま
export const groupByReadingDate = <Article extends { publishedAt: string }>(
  articles: readonly Article[],
): Array<{ date: string; articles: Article[] }> =>
  [...Map.groupBy(articles, ({ publishedAt }) => readingDateOf(publishedAt))]
    .map(([date, dayArticles]) => ({ date, articles: dayArticles }))
    .toSorted((a, b) => b.date.localeCompare(a.date));
