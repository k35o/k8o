import { News, NewsPagination } from '../_types';
import { NewsLayout } from './_components/news-layout';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const apiEndpoint = process.env.MICROCMS_API_ENDPOINT;
  const apiKey = process.env.MICROCMS_API_KEY;

  if (!apiEndpoint || !apiKey) {
    console.warn(
      'MICROCMS_API_ENDPOINT or MICROCMS_API_KEY is not configured',
    );
    return [];
  }

  const url = `${apiEndpoint}/news`;
  const newsList = await fetch(url, {
    headers: {
      'X-MICROCMS-API-KEY': apiKey,
    },
    cache: 'force-cache',
  }).then((res) => res.json() as Promise<NewsPagination>);

  return newsList.contents.map((news) => ({
    id: news.id,
  }));
}

async function getNews(id: string, draftKey?: string): Promise<News> {
  const { isEnabled } = await draftMode();
  const apiEndpoint = process.env.MICROCMS_API_ENDPOINT;
  const apiKey = process.env.MICROCMS_API_KEY;

  if (!apiEndpoint || !apiKey) {
    notFound();
  }

  const baseUrl = `${apiEndpoint}/news/${id}`;
  const url =
    isEnabled && draftKey
      ? `${baseUrl}?draftKey=${draftKey}`
      : baseUrl;
  const res = await fetch(url, {
    headers: {
      'X-MICROCMS-API-KEY': apiKey,
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
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ draftKey: string }>;
}) {
  const { id } = await params;
  const { draftKey } = await searchParams;
  const news = await getNews(id, draftKey);

  return (
    <NewsLayout {...news}>
      <section
        dangerouslySetInnerHTML={{ __html: news.description }}
      />
    </NewsLayout>
  );
}
