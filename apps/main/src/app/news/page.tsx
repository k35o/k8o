import { draftMode } from 'next/headers';
import { Suspense } from 'react';
import { NewsCard } from './_components/news-card';
import type { NewsPagination } from './_types';

async function _fetchNews(
  isDraft: boolean,
  draftKey?: string,
): Promise<NewsPagination> {
  'use cache';

  const baseUrl = `${process.env['MICROCMS_API_ENDPOINT'] ?? ''}/news`;
  const url = isDraft && draftKey ? `${baseUrl}?draftKey=${draftKey}` : baseUrl;
  const res = await fetch(url, {
    headers: {
      'X-MICROCMS-API-KEY': process.env['MICROCMS_API_KEY'] ?? '',
    },
    cache: 'force-cache',
  });

  return res.json() as Promise<NewsPagination>;
}

async function getNews(draftKey?: string): Promise<NewsPagination> {
  const { isEnabled } = await draftMode();
  return _fetchNews(isEnabled, draftKey);
}

async function NewsContent({ searchParams }: PageProps<'/news'>) {
  const { draftKey } = await searchParams;
  // TODO: Paginationに対応する
  const newsData = await getNews(
    typeof draftKey === 'string' ? draftKey : undefined,
  );

  if (!newsData?.contents) {
    return (
      <section className="flex h-full flex-col gap-6">
        <p>ニュースが見つかりませんでした。</p>
      </section>
    );
  }

  const { contents } = newsData;

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

export default function Page(props: PageProps<'/news'>) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewsContent {...props} />
    </Suspense>
  );
}
