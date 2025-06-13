import { Card } from '@/components/card';
import { IconLink } from '@/components/icon-link';
import {
  BlogIcon,
  ExternalLinkIcon,
  LocationIcon,
  PublishDateIcon,
  SlideIcon,
} from '@/components/icons';
import { LinkButton } from '@/components/link-button';
import { TextTag } from '@/components/text-tag';
import { formatDate } from '@/helpers/date/format';
import { Route } from 'next';
import { FC } from 'react';

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
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            {title}
            <IconLink label="イベントのリンク" href={eventUrl}>
              <ExternalLinkIcon />
            </IconLink>
          </h2>
          <p className="text-fg-mute text-lg">{eventName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="text-fg-mute flex items-center gap-1">
            <PublishDateIcon size="sm" />
            <span>{formatDate(new Date(eventDate))}</span>
          </div>
          {eventLocation && (
            <div className="text-fg-mute flex items-center gap-1">
              <LocationIcon size="sm" />
              <span>{eventLocation}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <TextTag
              key={tag.id}
              size="sm"
              text={tag.name}
              href={`/tags/${tag.id.toString()}` as Route}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          <LinkButton
            href={slideUrl}
            variant="outlined"
            size="sm"
            startIcon={<SlideIcon size="sm" />}
          >
            スライドを見る
          </LinkButton>
          <LinkButton
            size="sm"
            startIcon={<BlogIcon size="sm" />}
            href={`/blog/${blog.slug}` as Route}
          >
            ブログで解説を読む
          </LinkButton>
        </div>
      </div>
    </Card>
  );
};
