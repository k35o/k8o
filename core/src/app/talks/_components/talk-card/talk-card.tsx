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
import { formatDate } from '@k8o/helpers/date';
import Link from 'next/link';
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
          <h2 className="flex items-center gap-2 text-lg font-bold md:text-2xl">
            {title}
            <IconLink label="イベントのリンク" href={eventUrl}>
              <ExternalLinkIcon />
            </IconLink>
          </h2>
          <p className="text-fg-mute text-md md:text-lg">
            {eventName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="text-fg-mute md:text-md flex items-center gap-1 text-sm">
            <PublishDateIcon size="sm" />
            <span>{formatDate(new Date(eventDate))}</span>
          </div>
          {eventLocation && (
            <div className="text-fg-mute md:text-md flex items-center gap-1 text-sm">
              <LocationIcon size="sm" />
              <span>{eventLocation}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <Link key={tag.id} href={`/tags/${tag.id.toString()}`}>
              <TextTag
                key={tag.id}
                size="sm"
                text={tag.name}
                clickable
              />
            </Link>
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
            href={`/blog/${blog.slug}`}
            renderAnchor={(props) => <Link {...props} />}
          >
            ブログで解説を読む
          </LinkButton>
        </div>
      </div>
    </Card>
  );
};
