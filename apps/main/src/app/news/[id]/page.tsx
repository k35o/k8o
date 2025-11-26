import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import type { News, NewsPagination } from '../_types';
import { NewsLayout } from './_components/news-layout';

export async function generateStaticParams() {
  const url = `${process.env['MICROCMS_API_ENDPOINT'] ?? ''}/news`;
  const newsList = await fetch(url, {
    headers: {
      'X-MICROCMS-API-KEY': process.env['MICROCMS_API_KEY'] ?? '',
    },
    cache: 'force-cache',
  }).then((res) => res.json() as Promise<NewsPagination>);

  return newsList.contents.map((news) => ({
    id: news.id,
  }));
}

async function getNews(id: string, draftKey?: string): Promise<News> {
  const { isEnabled } = await draftMode();
  const baseUrl = `${process.env['MICROCMS_API_ENDPOINT'] ?? ''}/news/${id}`;
  const url =
    isEnabled && draftKey ? `${baseUrl}?draftKey=${draftKey}` : baseUrl;
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

export default async function Page({
  params,
  searchParams,
}: PageProps<'/news/[id]'>) {
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
