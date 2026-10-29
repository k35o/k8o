'use client';

import { href } from '@k8ordo/framework';
import {
  Badge,
  BlogIcon,
  Button,
  Card,
  ExternalLinkIcon,
  IconButton,
  PublishDateIcon,
  SlideIcon,
} from '@k8ordo/ui';
import { formatDate } from '@repo/helpers/date/format';
import type { FC, ReactNode } from 'react';

import styles from './talk-card.module.css';

export const TalkCardView: FC<{
  title: string;
  eventUrl: string;
  eventName: string;
  eventDate: string;
  eventLocation: string | null;
  locationIcon: ReactNode;
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
  locationIcon,
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
            {locationIcon}
            <span>{eventLocation}</span>
          </div>
        )}
      </div>
      <div className={styles.tags}>
        {tags.map((tag) => (
          <a href={href('/tags/:id', { id: tag.id })} key={tag.id}>
            <Badge interactive key={tag.id} size="sm" label={tag.name} />
          </a>
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
          renderItem={({
            children,
            disabled: _disabled,
            type: _type,
            ...props
          }) => (
            <a href={href('/blog/:slug', { slug: blog.slug })} {...props}>
              {children}
            </a>
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
