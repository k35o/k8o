import { draftMode } from 'next/headers';
import { NewsCard } from './_components/news-card';
import type { NewsPagination } from './_types';

async function getNews(draftKey?: string): Promise<NewsPagination> {
  const { isEnabled } = await draftMode();
  const baseUrl = `${process.env.MICROCMS_API_ENDPOINT ?? ''}/news`;
  const url =
    isEnabled && draftKey ? `${baseUrl}?draftKey=${draftKey}` : baseUrl;
  const res = await fetch(url, {
    headers: {
      'X-MICROCMS-API-KEY': process.env.MICROCMS_API_KEY ?? '',
    },
    cache: 'force-cache',
  });

  return res.json() as Promise<NewsPagination>;
}

export default async function Page({ searchParams }: PageProps<'/news'>) {
  const { draftKey } = await searchParams;
  // TODO: Paginationに対応する
  const { contents } = await getNews(
    typeof draftKey === 'string' ? draftKey : undefined,
  );

  return (
    <section className="flex h-full flex-col gap-6">
      {contents.map((news) => {
        return (
          <NewsCard
            createdAt={news.createdAt}
            draftKey={typeof draftKey === 'string' ? draftKey : ''}
            id={news.id}
            key={news.id}
            summary={news.summary}
            title={news.title}
            updatedAt={news.updatedAt}
          />
        );
      })}
    </section>
  );
}
