import { href } from '@k8ordo/framework';
import { Anchor, Badge, Card } from '@k8ordo/ui';
import { BookTextIcon, CalendarIcon, MapPinIcon } from '@k8ordo/ui/icons';
import { formatDate } from '@repo/helpers/date/format';
import type { FC } from 'react';

import styles from './talk-card.module.css';

export const TalkCard: FC<{
  title: string;
  eventUrl: string;
  eventName: string;
  eventDate: string;
  eventLocation: string | null;
  // k8o.me のデッキのページ
  slidesHref: string | null;
  // k8o.me のデッキの 1 ページ目
  cover: {
    src: string;
    srcSet: string;
    width: number;
    height: number;
  } | null;
  blog: {
    id: number;
    slug: string;
  } | null;
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
  slidesHref,
  cover,
  blog,
  tags,
}) => (
  <Card>
    <div className={styles.root}>
      {cover !== null && slidesHref !== null && (
        // 同じ行き先をタイトルのリンクが持つので、表紙はポインター専用にして読み上げと Tab から外す
        <a
          aria-hidden="true"
          className={styles.cover}
          href={slidesHref}
          tabIndex={-1}
        >
          <img
            alt=""
            className={styles.coverImage}
            height={cover.height}
            sizes="(width >= 48rem) 20rem, 100vw"
            src={cover.src}
            srcSet={cover.srcSet}
            width={cover.width}
          />
        </a>
      )}
      <div className={styles.body}>
        <div className={styles.heading}>
          <h2 className={styles.title}>
            {slidesHref === null ? (
              title
            ) : (
              <Anchor href={slidesHref}>{title}</Anchor>
            )}
          </h2>
          <p className={styles.event}>
            <Anchor href={eventUrl}>{eventName}</Anchor>
          </p>
        </div>
        <div className={styles.details}>
          <div className={styles.detail}>
            <CalendarIcon size="sm" />
            <span>{formatDate(new Date(eventDate))}</span>
          </div>
          {eventLocation !== null && (
            <div className={styles.detail}>
              <MapPinIcon size="sm" />
              <span>{eventLocation}</span>
            </div>
          )}
        </div>
        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((tag) => (
              <a
                className={styles.tag}
                href={href('/tags/:id', { id: tag.id })}
                key={tag.id}
              >
                <Badge size="sm" label={tag.name} />
              </a>
            ))}
          </div>
        )}
        {blog !== null && (
          <p className={styles.blog}>
            <BookTextIcon size="sm" />
            <Anchor href={href('/blog/:slug', { slug: blog.slug })}>
              ブログで解説を読む
            </Anchor>
          </p>
        )}
      </div>
    </div>
  </Card>
);
