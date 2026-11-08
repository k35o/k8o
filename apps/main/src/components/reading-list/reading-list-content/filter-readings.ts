import { matchesSearchQuery } from '@/shared/search/search-filter';

import type { SortOrder } from '../constants/constants';

type Reading = {
  title: string;
  publishedAt: string;
  source: { id: number };
};

// 題を、ほかの一覧と同じ検索の規則（NFKC・空白で区切った語のすべてを含む）で絞る
export const filterReadings = <Item extends Reading>(
  articles: readonly Item[],
  {
    query,
    sourceIds,
    sortOrder,
  }: { query: string; sourceIds: readonly number[]; sortOrder: SortOrder },
): Item[] =>
  articles
    .filter(
      (article) =>
        matchesSearchQuery(query, [article.title]) &&
        (sourceIds.length === 0 || sourceIds.includes(article.source.id)),
    )
    .toSorted((a, b) => {
      const diff =
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      return sortOrder === 'oldest' ? -diff : diff;
    });
