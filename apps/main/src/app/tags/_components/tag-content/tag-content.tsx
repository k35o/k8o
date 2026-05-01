import { Heading, TagIcon } from '@k8o/arte-odyssey';
import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';

import { TagCard } from '../tag-card';

export const TagContent: FC<{
  name: string;
  blogs: Array<{
    id: number;
    slug: string;
    title: string;
  }>;
  talks: Array<{
    id: number;
    title: string;
  }>;
}> = ({ name, blogs, talks }) => (
  <div className="flex flex-col gap-8">
    <div className="bg-bg-base flex items-center gap-4 rounded-xl p-6 shadow-sm">
      <div className="bg-primary-bg text-primary-fg flex size-10 items-center justify-center rounded-full">
        <TagIcon />
      </div>
      <div className="flex flex-col gap-2">
        <Heading type="h3">{name}</Heading>
        <p className="text-fg-mute text-sm">
          {blogs.length + talks.length}
          件のコンテンツがあります
        </p>
      </div>
    </div>
    <div className="flex flex-col gap-8">
      {blogs.length > 0 && (
        <div className="flex flex-col gap-4">
          <Link href="/blog">
            <Heading type="h4">Blog</Heading>
          </Link>
          <div className="grid-cols-auto-fill-70 grid justify-items-center gap-4">
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
          <div className="grid-cols-auto-fill-70 grid justify-items-center gap-4">
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
