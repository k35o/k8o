import { NewsCard } from './news-card';

type News = {
  contents: {
    title: string;
    summary: string;
    createdAt: string;
    updatedAt: string;
  }[];
  totalCount: number;
  offset: number;
  limit: number;
};

async function getNews(): Promise<News> {
  const res = await fetch(
    `${process.env.MICROCMS_API_ENDPOINT ?? ''}/news`,
    {
      headers: {
        'X-MICROCMS-API-KEY': process.env.MICROCMS_API_KEY ?? '',
      },
      cache: 'force-cache',
    },
  );

  return res.json() as Promise<News>;
}

export default async function Page() {
  // TODO: Paginationに対応する
  const { contents } = await getNews();
  return (
    <section className="flex h-full flex-col gap-6">
      {contents.map((news) => {
        return (
          <NewsCard
            key={news.title}
            title={news.title}
            summary={news.summary}
            createdAt={news.createdAt}
            updatedAt={news.updatedAt}
          />
        );
      })}
    </section>
  );
}
