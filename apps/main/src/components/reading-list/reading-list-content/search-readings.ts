import { matchesSearchQuery } from '@/shared/search/search-filter';

type Reading = {
  title: string;
  publishedAt: string;
  sourceTitle: string;
};

type Day<Item extends Reading> = {
  picks: ReadonlyArray<{ article: Item }>;
  topics: ReadonlyArray<{ articles: readonly Item[] }>;
};

// 日ごとのまとめに入った記事から、題かソースの名前が当たるものを、ほかの一覧と同じ検索の規則（NFKC・
// 空白で区切った語のすべてを含む）で選び、新しい順に並べる
export const searchReadings = <Item extends Reading>(
  days: ReadonlyArray<Day<Item>>,
  query: string,
): Item[] =>
  days
    .flatMap((day) => [
      ...day.picks.map(({ article }) => article),
      ...day.topics.flatMap(({ articles }) => articles),
    ])
    .filter((article) =>
      matchesSearchQuery(query, [article.title, article.sourceTitle]),
    )
    .toSorted(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
