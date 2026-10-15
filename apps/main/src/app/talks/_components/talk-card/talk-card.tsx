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
} from '@k8ordo/ui';
import { formatDate } from '@repo/helpers/date/format';
import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';

import styles from './talk-card.module.css';

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
    <div className={styles.root}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {title}
          <IconButton
            label="イベントのリンク"
            renderItem={({
              children,
              disabled: _disabled,
              triggerProps,
              type: _type,
              ...props
            }) => (
              <a
                href={eventUrl}
                rel="noopener noreferrer"
                target="_blank"
                {...props}
                {...triggerProps}
              >
                {children}
              </a>
            )}
          >
            <ExternalLinkIcon />
          </IconButton>
        </h2>
        <p className={styles.event}>{eventName}</p>
      </div>
      <div className={styles.details}>
        <div className={styles.detail}>
          <PublishDateIcon size="sm" />
          <span>{formatDate(new Date(eventDate))}</span>
        </div>
        {eventLocation !== null && (
          <div className={styles.detail}>
            <LocationIcon size="sm" />
            <span>{eventLocation}</span>
          </div>
        )}
      </div>
      <div className={styles.tags}>
        {tags.map((tag) => (
          <Link href={`/tags/${tag.id.toString()}`} key={tag.id}>
            <Badge interactive key={tag.id} size="sm" label={tag.name} />
          </Link>
        ))}
      </div>
      <div className={styles.actions}>
        <Button
          renderItem={({
            children,
            disabled: _disabled,
            type: _type,
            ...props
          }) => (
            <a
              href={slideUrl}
              rel="noopener noreferrer"
              target="_blank"
              {...props}
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
          // next/link は onClick や ref に明示的な undefined を受けない
          // (exactOptionalPropertyTypes) ため、束は展開せず要るものだけ取り出す
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
