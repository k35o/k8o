'use client';

import { formatDate } from '@repo/helpers/date/format';
import { isHttpUrl } from '@repo/helpers/url/is-http-url';
import { memo, useState } from 'react';
import type { FC } from 'react';

import { replayImageError } from '@/shared/browser/replay-image-error';

import type { ReadingArticle } from '../reading-list-source/reading-list-source';

import styles from './reading-row.module.css';

// 読めなかった画像は枠ごと出さない
const Thumbnail: FC<{ src: string }> = ({ src }) => {
  const [isError, setIsError] = useState(false);
  if (isError) {
    return null;
  }
  return (
    <img
      alt=""
      className={styles.thumbnail}
      decoding="async"
      loading="lazy"
      onError={() => {
        setIsError(true);
      }}
      ref={replayImageError}
      src={src}
    />
  );
};

/**
 * 記事の 1 行。題・本文・出どころと、あれば OG の画像を並べる。本文は、note を渡せばそれを、
 * 渡さなければ記事の要約か説明を出す
 */
export const ReadingRow: FC<{
  article: ReadingArticle;
  note?: string;
  showsDate?: boolean;
}> = memo(function ReadingRow({ article, note, showsDate = false }) {
  const body = article.summary ?? article.description;
  return (
    <li className={styles.root}>
      <div className={styles.text}>
        {isHttpUrl(article.url) ? (
          <a
            className={styles.title}
            href={article.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            {article.title}
          </a>
        ) : (
          <p className={styles.title}>{article.title}</p>
        )}
        {note === undefined ? (
          body !== null && <p className={styles.summary}>{body}</p>
        ) : (
          <p className={styles.note}>{note}</p>
        )}
        <p className={styles.meta}>
          {article.sourceTitle}
          {showsDate &&
            `・${formatDate(new Date(article.publishedAt), 'yyyy年M月d日')}`}
        </p>
      </div>
      {article.imageUrl !== null && <Thumbnail src={article.imageUrl} />}
    </li>
  );
});
