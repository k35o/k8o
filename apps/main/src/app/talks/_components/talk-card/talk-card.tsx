import { Card } from '@k8o/arte-odyssey/card';
import { IconLink } from '@k8o/arte-odyssey/icon-link';
import {
  BlogIcon,
  ExternalLinkIcon,
  LocationIcon,
  PublishDateIcon,
  SlideIcon,
} from '@k8o/arte-odyssey/icons';
import { LinkButton } from '@k8o/arte-odyssey/link-button';
import { TextTag } from '@k8o/arte-odyssey/text-tag';
import { formatDate } from '@k8o/helpers/date/format';
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
  tags: {
    id: number;
    name: string;
  }[];
}> = ({
  title,
  eventUrl,
  eventName,
  eventDate,
  eventLocation,
  slideUrl,
  blog,
  tags,
}) => {
  return (
    <Card>
      <div className="flex flex-col gap-6 p-8">
        <div className="flex flex-col gap-2">
          <h2 className="flex items-center gap-2 font-bold text-lg md:text-2xl">
            {title}
            <IconLink href={eventUrl} label="イベントのリンク">
              <ExternalLinkIcon />
            </IconLink>
          </h2>
          <p className="text-fg-mute text-md md:text-lg">{eventName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 text-fg-mute text-sm md:text-md">
            <PublishDateIcon size="sm" />
            <span>{formatDate(new Date(eventDate))}</span>
          </div>
          {eventLocation && (
            <div className="flex items-center gap-1 text-fg-mute text-sm md:text-md">
              <LocationIcon size="sm" />
              <span>{eventLocation}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <Link href={`/tags/${tag.id.toString()}`} key={tag.id}>
              <TextTag clickable key={tag.id} size="sm" text={tag.name} />
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          <LinkButton
            href={slideUrl}
            size="sm"
            startIcon={<SlideIcon size="sm" />}
            variant="outlined"
          >
            スライドを見る
          </LinkButton>
          <LinkButton
            href={`/blog/${blog.slug}` as Route}
            renderAnchor={(props) => <Link {...props} />}
            size="sm"
            startIcon={<BlogIcon size="sm" />}
          >
            ブログで解説を読む
          </LinkButton>
        </div>
      </div>
    </Card>
  );
};
