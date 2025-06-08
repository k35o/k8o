'use client';

import { ViewTransition } from '#libs/react';
import {
  PublishDateIcon,
  SlideIcon,
  TagIcon,
  UpdateDateIcon,
} from '@/components/icons';
import { LinkButton } from '@/components/link-button';
import { ScrollLinked } from '@/components/scroll-linked';
import { Separator } from '@/components/separator';
import { TextTag } from '@/components/text-tag';
import { formatDate } from '@/utils/date/format';
import { Route } from 'next';
import { FC, PropsWithChildren, ReactNode } from 'react';

export const Content: FC<
  PropsWithChildren<{
    blog: {
      id: number;
      slug: string;
      tags: {
        id: number;
        name: string;
      }[];
      slideUrl: string | undefined;
      title: string;
      description: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
    views: ReactNode;
  }>
> = ({ blog, children, views }) => {
  return (
    <article className="bg-bg-base/90 rounded-md px-3 pt-8 pb-14 sm:px-10">
      <div className="flex flex-col gap-3">
        <ViewTransition name={`title-${blog.slug}`}>
          <h2 className="text-xl font-bold sm:text-2xl">
            {blog.title}
          </h2>
        </ViewTransition>
        {blog.description && (
          <ViewTransition name={`description-${blog.slug}`}>
            <div
              className="bg-bg-mute rounded-md p-4 sm:mt-4"
              aria-label="記事の要約"
            >
              <p className="text-fg-base sm:text-md text-sm">
                {blog.description}
              </p>
            </div>
          </ViewTransition>
        )}
        {blog.slideUrl && (
          <div className="flex self-end">
            <LinkButton
              href={blog.slideUrl}
              variant="outlined"
              size="sm"
              startIcon={<SlideIcon size="sm" />}
            >
              スライドを見る
            </LinkButton>
          </div>
        )}
        <div className="text-fg-mute flex flex-col items-end gap-1 text-xs sm:flex-row sm:items-center sm:justify-end sm:gap-2 sm:text-sm">
          <div className="flex flex-wrap items-center justify-end gap-1">
            <ViewTransition name={`date-${blog.slug}`}>
              <div className="flex items-center gap-1">
                <PublishDateIcon size="sm" />
                <span>公開: {formatDate(blog.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <UpdateDateIcon size="sm" />
                <span>更新: {formatDate(blog.updatedAt)}</span>
              </div>
            </ViewTransition>
          </div>
          {views}
        </div>
      </div>
      <div className="m-2 w-full sm:mt-4">
        <Separator />
      </div>
      <ViewTransition name={`tags-${blog.slug}`}>
        {blog.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <TagIcon size="sm" />
            {blog.tags.map((tag) => {
              return (
                <TextTag
                  key={tag.id}
                  text={tag.name}
                  href={`/tags/${tag.id.toString()}` as Route}
                />
              );
            })}
          </div>
        )}
      </ViewTransition>
      {children}
      <ScrollLinked />
    </article>
  );
};
