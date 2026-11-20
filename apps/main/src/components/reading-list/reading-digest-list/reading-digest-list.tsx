'use client';

import { ChevronIcon } from '@k8ordo/ui/icons';
import { formatDate } from '@repo/helpers/date/format';
import { isHttpUrl } from '@repo/helpers/url/is-http-url';
import { useId, useMemo, useState } from 'react';
import type { FC, ReactNode } from 'react';

import { replayImageError } from '@/shared/browser/replay-image-error';

import type { ReadingList } from '../reading-list-source/reading-list-source';
import { toDigestDays } from './digest-days';
import type { DigestTopicView } from './digest-days';

import styles from './reading-digest-list.module.css';

type Article = ReadingList['articles'][number];
type Kind = ReadingList['digests'][number]['topics'][number]['kind'];

// other は、話題に分けていない記事のまとまりなので、札を出さない
const KIND_LABEL: Record<Kind, string | null> = {
  release: 'リリース',
  explainer: '解説',
  opinion: '考察',
  report: 'レポート',
  announcement: '告知',
  security: 'セキュリティ',
  other: null,
};

const sourcesOf = (articles: readonly Article[]): string =>
  [...new Set(articles.map((article) => article.source.title))].join('、');

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

const ArticleRow: FC<{ article: Article; children: ReactNode }> = ({
  article,
  children,
}) => (
  <li className={styles.article}>
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
      {children}
      <p className={styles.source}>{article.source.title}</p>
    </div>
    {article.imageUrl !== null && <Thumbnail src={article.imageUrl} />}
  </li>
);

const Topic: FC<{ topic: DigestTopicView<Article, Kind> }> = ({ topic }) => {
  const [isOpen, setIsOpen] = useState(false);
  const articlesId = useId();
  const kindLabel = KIND_LABEL[topic.kind];

  return (
    <li>
      <button
        aria-controls={articlesId}
        aria-expanded={isOpen}
        className={styles.topic}
        onClick={() => {
          setIsOpen((open) => !open);
        }}
        type="button"
      >
        <span className={styles.chevron}>
          <ChevronIcon direction={isOpen ? 'down' : 'right'} size="sm" />
        </span>
        <span className={styles.heading}>
          <span className={styles.headline}>
            {kindLabel !== null && (
              <span className={styles.kind}>{kindLabel}</span>
            )}
            {topic.headline}
          </span>
          <span className={styles.sources}>
            {sourcesOf(topic.articles)}・{topic.articles.length}件
          </span>
        </span>
      </button>
      <ul className={styles.articles} hidden={!isOpen} id={articlesId}>
        {isOpen &&
          topic.articles.map((article) => (
            <ArticleRow article={article} key={article.id}>
              {(article.summary ?? article.description) !== null && (
                <p className={styles.summary}>
                  {article.summary ?? article.description}
                </p>
              )}
            </ArticleRow>
          ))}
      </ul>
    </li>
  );
};

/**
 * 記事を日ごとに分け、その日の全体像・特に見てほしい記事・残りの話題の順に並べる。
 * 話題を押すと、その話題の記事が開く
 */
export const ReadingDigestList: FC<{
  // 新しい順
  articles: ReadingList['articles'];
  digests: ReadingList['digests'];
}> = ({ articles, digests }) => {
  const days = useMemo(
    () => toDigestDays(articles, digests),
    [articles, digests],
  );

  return (
    <div className={styles.root}>
      {days.map((day) => (
        <section className={styles.day} key={day.date}>
          <h3 className={styles.date}>
            {formatDate(new Date(`${day.date}T00:00:00+09:00`), 'M月d日(E)')}
            <span className={styles.count}>{day.articleCount}件</span>
          </h3>
          {day.overview !== null && (
            <p className={styles.overview}>{day.overview}</p>
          )}
          {day.picks.length > 0 && (
            <div className={styles.block}>
              <h4 className={styles.label}>見てほしい</h4>
              <ul className={styles.picks}>
                {day.picks.map(({ article, reason }) => (
                  <ArticleRow article={article} key={article.id}>
                    <p className={styles.reason}>{reason}</p>
                  </ArticleRow>
                ))}
              </ul>
            </div>
          )}
          {day.topics.length > 0 && (
            <div className={styles.block}>
              {day.picks.length > 0 && (
                <h4 className={styles.label}>そのほか</h4>
              )}
              <ul className={styles.topics}>
                {day.topics.map((topic) => (
                  <Topic key={topic.headline} topic={topic} />
                ))}
              </ul>
            </div>
          )}
        </section>
      ))}
    </div>
  );
};
