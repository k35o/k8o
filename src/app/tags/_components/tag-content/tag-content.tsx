import { TagCard } from '../tag-card';
import { Heading } from '@/components/heading';
import { TagIcon } from '@/components/icons';
import { Route } from 'next';
import Link from 'next/link';
import { FC } from 'react';

export const TagContent: FC<{
  name: string;
  blogs: {
    id: number;
    slug: string;
    title: string;
  }[];
  services: {
    id: number;
    slug: string;
    title: string;
  }[];
  talks: {
    id: number;
    title: string;
  }[];
}> = ({ name, blogs, services, talks }) => {
  return (
    <div className="flex flex-col gap-8">
      <div className="bg-bg-base flex items-center gap-4 rounded-lg p-6">
        <div className="bg-primary-bg text-primary-fg flex size-10 items-center justify-center rounded-full">
          <TagIcon />
        </div>
        <div className="flex flex-col gap-2">
          <Heading type="h3">{name}</Heading>
          <p className="text-fg-mute text-sm">
            {blogs.length + services.length + talks.length}
            件のコンテンツがあります
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-8">
        {services.length > 0 && (
          <div className="flex flex-col gap-4">
            <Link href="/">
              <Heading type="h4">サービス</Heading>
            </Link>
            <div className="grid-cols-auto-fill-70 grid justify-items-center gap-4">
              {services.map((service) => (
                <TagCard
                  key={service.id}
                  title={service.title}
                  href={`/${service.slug}` as Route}
                  label="サービスを利用する"
                  linkLabel={`「${service.title}」のサービスを利用する`}
                />
              ))}
            </div>
          </div>
        )}
        {blogs.length > 0 && (
          <div className="flex flex-col gap-4">
            <Link href="/blog">
              <Heading type="h4">Blog</Heading>
            </Link>
            <div className="grid-cols-auto-fill-70 grid justify-items-center gap-4">
              {blogs.map((blog) => (
                <TagCard
                  key={blog.id}
                  title={blog.title}
                  href={`/blog/${blog.slug}` as Route}
                  label="ブログを読む"
                  linkLabel={`「${blog.title}」のブログを読む`}
                />
              ))}
            </div>
          </div>
        )}
        {talks.length > 0 && (
          <div className="flex flex-col gap-4">
            <Link href="/talks">
              <Heading type="h4">Talks</Heading>
            </Link>
            <div className="grid-cols-auto-fill-70 grid justify-items-center gap-4">
              {talks.map((talk) => (
                <TagCard
                  key={talk.id}
                  title={talk.title}
                  href="/talks"
                  label="Talks"
                  linkLabel="Talksを開く"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
