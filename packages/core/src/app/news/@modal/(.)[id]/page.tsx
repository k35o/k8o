import { PublishDateIcon, UpdateDateIcon } from '@k8o/arte-odyssey/icons';
import { formatDate } from '@k8o/helpers/date/format';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import type { News, NewsPagination } from '../../_types';
import { NewsModal } from '../_components/news-modal';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const url = `${process.env.MICROCMS_API_ENDPOINT ?? ''}/news`;
  const newsList = await fetch(url, {
    headers: {
      'X-MICROCMS-API-KEY': process.env.MICROCMS_API_KEY ?? '',
    },
    cache: 'force-cache',
  }).then((res) => res.json() as Promise<NewsPagination>);

  return newsList.contents.map((news) => ({
    id: news.id,
  }));
}

async function getNews(id: string, draftKey?: string): Promise<News> {
  const { isEnabled } = await draftMode();
  const baseUrl = `${process.env.MICROCMS_API_ENDPOINT ?? ''}/news/${id}`;
  const url =
    isEnabled && draftKey ? `${baseUrl}?draftKey=${draftKey}` : baseUrl;
  const res = await fetch(url, {
    headers: {
      'X-MICROCMS-API-KEY': process.env.MICROCMS_API_KEY ?? '',
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
    <NewsModal title={news.title}>
      <div className="flex w-full flex-col gap-5">
        <div className="flex flex-wrap items-center justify-center gap-1 text-fg-mute text-xs">
          <div className="flex items-center gap-1">
            <PublishDateIcon size="sm" />
            <span>公開: {formatDate(new Date(news.createdAt))}</span>
          </div>
          <div className="flex items-center gap-1">
            <UpdateDateIcon size="sm" />
            <span>更新: {formatDate(new Date(news.updatedAt))}</span>
          </div>
        </div>
        <section
          className="max-h-96 overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: news.description }}
        />
      </div>
    </NewsModal>
  );
}
