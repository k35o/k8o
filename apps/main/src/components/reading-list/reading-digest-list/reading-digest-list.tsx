'use client';

import { ChevronIcon } from '@k8ordo/ui/icons';
import { formatDate } from '@repo/helpers/date/format';
import { useEffect, useEffectEvent, useId, useState } from 'react';
import type { FC } from 'react';

import type {
  ReadingArticle,
  ReadingDay,
} from '../reading-list-source/reading-list-source';
import { ReadingRow } from '../reading-row/reading-row';

import styles from './reading-digest-list.module.css';

type Topic = ReadingDay['topics'][number];

// other は、話題に分けていない記事のまとまりなので、札を出さない
const KIND_LABEL: Record<Topic['kind'], string | null> = {
  release: 'リリース',
  explainer: '解説',
  opinion: '考察',
  report: 'レポート',
  announcement: '告知',
  security: 'セキュリティ',
  other: null,
};

const sourcesOf = (articles: readonly ReadingArticle[]): string =>
  [...new Set(articles.map((article) => article.sourceTitle))].join('、');

const TopicItem: FC<{ topic: Topic }> = ({ topic }) => {
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
            <ReadingRow article={article} key={article.id} />
          ))}
      </ul>
    </li>
  );
};

/**
 * 日ごとに、その日の全体像・特に見てほしい記事・残りの話題の順に並べる。話題を押すと、その話題の
 * 記事が開く。日の区画は日付（YYYY-MM-DD）を id に持ち、URL の fragment がそれを指していれば、
 * 描いたあとにその日まで移る
 */
export const ReadingDigestList: FC<{ days: readonly ReadingDay[] }> = ({
  days,
}) => {
  const scrollToFragmentDay = useEffectEvent((): void => {
    const date = decodeURIComponent(location.hash.slice(1));
    if (days.some((day) => day.date === date)) {
      document.querySelector(`#${CSS.escape(date)}`)?.scrollIntoView();
    }
  });
  // 一覧は api を読んでから描くので、文書を読んだときのブラウザの移動では、fragment の日がまだ無い
  useEffect(() => {
    scrollToFragmentDay();
  }, []);

  return (
    <div className={styles.root}>
      {days.map((day) => (
        <section className={styles.day} id={day.date} key={day.date}>
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
                  <ReadingRow
                    article={article}
                    key={article.id}
                    note={reason}
                  />
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
                  <TopicItem key={topic.headline} topic={topic} />
                ))}
              </ul>
            </div>
          )}
        </section>
      ))}
    </div>
  );
};
