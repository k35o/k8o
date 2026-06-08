'use client';

import {
  Badge,
  BlogIcon,
  Button,
  Card,
  ExternalLinkIcon,
  IconButton,
  LocationIcon,
  PublishDateIcon,
  SlideIcon,
} from '@k8o/arte-odyssey';
import { formatDate } from '@repo/helpers/date/format';
import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';

export const TalkCard: FC<{
  title: string;
  eventUrl: string;
  eventName: string;
  eventDate: string;
  eventLocation: string | null;
  slideUrl: string;
  blog: {
    id: number;
    slug: string;
  };
  tags: Array<{
    id: number;
    name: string;
  }>;
}> = ({
  title,
  eventUrl,
  eventName,
  eventDate,
  eventLocation,
  slideUrl,
  blog,
  tags,
}) => (
  <Card>
    <div className="flex flex-col gap-6 p-8">
      <div className="flex flex-col gap-2">
        <h2 className="flex items-center gap-2 text-lg font-bold md:text-2xl">
          {title}
          <IconButton
            label="イベントのリンク"
            renderItem={({
              className,
              children,
              'aria-label': ariaLabel,
              triggerProps,
            }) => (
              <a
                aria-label={ariaLabel}
                className={className}
                href={eventUrl}
                rel="noopener noreferrer"
                target="_blank"
                {...triggerProps}
              >
                {children}
              </a>
            )}
          >
            <ExternalLinkIcon />
          </IconButton>
        </h2>
        <p className="text-fg-mute text-md md:text-lg">{eventName}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="text-fg-mute md:text-md flex items-center gap-1 text-sm">
          <PublishDateIcon size="sm" />
          <span>{formatDate(new Date(eventDate))}</span>
        </div>
        {eventLocation !== null && (
          <div className="text-fg-mute md:text-md flex items-center gap-1 text-sm">
            <LocationIcon size="sm" />
            <span>{eventLocation}</span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <Link href={`/tags/${tag.id.toString()}`} key={tag.id}>
            <Badge interactive key={tag.id} size="sm" text={tag.name} />
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        <Button
          renderItem={({ className, children }) => (
            <a
              className={className}
              href={slideUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {children}
            </a>
          )}
          size="sm"
          startIcon={<SlideIcon size="sm" />}
          variant="outline"
        >
          スライドを見る
        </Button>
        <Button
          renderItem={({ className, children }) => (
            <Link className={className} href={`/blog/${blog.slug}` as Route}>
              {children}
            </Link>
          )}
          size="sm"
          startIcon={<BlogIcon size="sm" />}
        >
          ブログで解説を読む
        </Button>
      </div>
    </div>
  </Card>
);
