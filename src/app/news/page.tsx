import { NewsCard } from './_components/news-card';
import { NewsPagination } from './_types';
import { draftMode } from 'next/headers';

async function getNews(draftKey?: string): Promise<NewsPagination> {
  const { isEnabled } = await draftMode();
  const baseUrl = `${process.env.MICROCMS_API_ENDPOINT ?? ''}/news`;
  const url =
    isEnabled && draftKey
      ? `${baseUrl}?draftKey=${draftKey}`
      : baseUrl;
  const res = await fetch(url, {
    headers: {
      'X-MICROCMS-API-KEY': process.env.MICROCMS_API_KEY ?? '',
    },
    cache: 'force-cache',
  });

  return res.json() as Promise<NewsPagination>;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ draftKey: string }>;
}) {
  const { draftKey } = await searchParams;
  // TODO: Paginationに対応する
  const { contents } = await getNews(draftKey);

  return (
    <section className="flex h-full flex-col gap-6">
      {contents.map((news) => {
        return (
          <NewsCard
            key={news.id}
            id={news.id}
            title={news.title}
            summary={news.summary}
            createdAt={news.createdAt}
            updatedAt={news.updatedAt}
            draftKey={draftKey}
          />
        );
      })}
    </section>
  );
}
