import { Heading } from '@k8o/arte-odyssey/heading';
import { TagIcon } from '@k8o/arte-odyssey/icons';
import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';
import { TagCard } from '../tag-card';

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
      <div className="flex items-center gap-4 rounded-lg bg-bg-base p-6">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary-bg text-primary-fg">
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
            <div className="grid grid-cols-auto-fill-70 justify-items-center gap-4">
              {services.map((service) => (
                <TagCard
                  href={`/${service.slug}` as Route}
                  key={service.id}
                  label="サービスを利用する"
                  linkLabel={`「${service.title}」のサービスを利用する`}
                  title={service.title}
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
            <div className="grid grid-cols-auto-fill-70 justify-items-center gap-4">
              {blogs.map((blog) => (
                <TagCard
                  href={`/blog/${blog.slug}` as Route}
                  key={blog.id}
                  label="ブログを読む"
                  linkLabel={`「${blog.title}」のブログを読む`}
                  title={blog.title}
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
            <div className="grid grid-cols-auto-fill-70 justify-items-center gap-4">
              {talks.map((talk) => (
                <TagCard
                  href="/talks"
                  key={talk.id}
                  label="Talks"
                  linkLabel="Talksを開く"
                  title={talk.title}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
