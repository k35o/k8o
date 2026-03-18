import {
  getArticleSources,
  getArticles,
} from '@/services/reading-list/reading-list';
import { LinkCard } from '../_components/link-card';
import { FilterBar } from './_components/filter-bar';
import { type DateRange, isDateRange } from './_utils/constants';

const getDateThreshold = (range: DateRange): Date => {
  const now = new Date();
  switch (range) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'all':
      return new Date(0);
  }
};

const parseSourceIds = (value: string | undefined): number[] => {
  if (value === undefined) return [];
  return value
    .split(',')
    .map(Number)
    .filter((n) => !Number.isNaN(n));
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; source?: string; date?: string }>;
}) {
  const [articles, sources, params] = await Promise.all([
    getArticles(),
    getArticleSources(),
    searchParams,
  ]);

  const query = params.q?.toLowerCase() ?? '';
  const sourceIds = parseSourceIds(params.source);
  const dateRange: DateRange =
    params.date !== undefined && isDateRange(params.date) ? params.date : 'all';
  const dateThreshold = getDateThreshold(dateRange);

  // ソースごとの記事数を集計
  const articleCountBySource = new Map<number, number>();
  for (const article of articles) {
    const count = articleCountBySource.get(article.source.id) ?? 0;
    articleCountBySource.set(article.source.id, count + 1);
  }

  const sourcesWithCount = sources.map((source) => ({
    ...source,
    articleCount: articleCountBySource.get(source.id) ?? 0,
  }));

  const filtered = articles.filter((article) => {
    if (query && !article.title.toLowerCase().includes(query)) {
      return false;
    }
    if (sourceIds.length > 0 && !sourceIds.includes(article.source.id)) {
      return false;
    }
    if (dateRange !== 'all' && new Date(article.publishedAt) < dateThreshold) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <FilterBar resultCount={filtered.length} sources={sourcesWithCount} />
      {filtered.length === 0 ? (
        <p className="text-fg-mute text-sm">条件に一致する記事がありません。</p>
      ) : (
        <div className="grid grid-cols-auto-fill-80 gap-3">
          {filtered.map((article) => (
            <LinkCard href={article.url} key={article.id} variant="vertical" />
          ))}
        </div>
      )}
    </div>
  );
}
