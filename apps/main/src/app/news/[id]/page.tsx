import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import type { News, NewsPagination } from '../_types';
import { NewsLayout } from './_components/news-layout';

async function _getNewsList(): Promise<NewsPagination> {
  'use cache';

  const url = `${process.env['MICROCMS_API_ENDPOINT'] ?? ''}/news`;
  const newsList = await fetch(url, {
    headers: {
      'X-MICROCMS-API-KEY': process.env['MICROCMS_API_KEY'] ?? '',
    },
    cache: 'force-cache',
  }).then((res) => res.json() as Promise<NewsPagination>);

  return newsList;
}

export async function generateStaticParams() {
  const newsList = await _getNewsList();

  return newsList.contents.map((news) => ({
    id: news.id,
  }));
}

async function _fetchNews(
  id: string,
  isDraft: boolean,
  draftKey?: string,
): Promise<News> {
  'use cache';

  const baseUrl = `${process.env['MICROCMS_API_ENDPOINT'] ?? ''}/news/${id}`;
  const url = isDraft && draftKey ? `${baseUrl}?draftKey=${draftKey}` : baseUrl;
  const res = await fetch(url, {
    headers: {
      'X-MICROCMS-API-KEY': process.env['MICROCMS_API_KEY'] ?? '',
    },
    cache: 'force-cache',
  });

  if (!res.ok) {
    notFound();
  }

  return res.json() as Promise<News>;
}

async function getNews(id: string, draftKey?: string): Promise<News> {
  const { isEnabled } = await draftMode();
  return _fetchNews(id, isEnabled, draftKey);
}

async function NewsContent({ params, searchParams }: PageProps<'/news/[id]'>) {
  const { id } = await params;
  const { draftKey } = await searchParams;
  const news = await getNews(
    id,
    typeof draftKey === 'string' ? draftKey : undefined,
  );

  return (
    <NewsLayout {...news}>
      <section dangerouslySetInnerHTML={{ __html: news.description }} />
    </NewsLayout>
  );
}

export default function Page(props: PageProps<'/news/[id]'>) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewsContent {...props} />
    </Suspense>
  );
}
