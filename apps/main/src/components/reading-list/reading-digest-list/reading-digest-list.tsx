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

const KIND_LABEL: Record<Topic['kind'], string> = {
  release: 'リリース',
  explainer: '解説',
  opinion: '考察',
  report: 'レポート',
  announcement: '告知',
  security: 'セキュリティ',
};

const sourcesOf = (articles: readonly ReadingArticle[]): string =>
  [...new Set(articles.map((article) => article.sourceTitle))].join('、');

const TopicItem: FC<{
  kindLabel: string | null;
  headline: string;
  articles: readonly ReadingArticle[];
}> = ({ kindLabel, headline, articles }) => {
  const [isOpen, setIsOpen] = useState(false);
  const articlesId = useId();

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
            {headline}
          </span>
          <span className={styles.sources}>
            {sourcesOf(articles)}・{articles.length}件
          </span>
        </span>
      </button>
      <ul className={styles.articles} hidden={!isOpen} id={articlesId}>
        {isOpen &&
          articles.map((article) => (
            <ReadingRow article={article} key={article.id} />
          ))}
      </ul>
    </li>
  );
};

/**
 * 日ごとに、その日の全体像・注目の記事・話題・まとめに入らなかった記事の順に並べる。話題を
 * 押すと、その話題の記事が開く。日の区画は日付（YYYY-MM-DD）を id に持ち、URL の fragment がそれを指していれば、
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
              <h4 className={styles.label}>注目の記事</h4>
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
          {(day.topics.length > 0 || day.remainingArticles.length > 0) && (
            <div className={styles.block}>
              {day.picks.length > 0 && <h4 className={styles.label}>話題</h4>}
              <ul className={styles.topics}>
                {day.topics.map((topic) => (
                  <TopicItem
                    articles={topic.articles}
                    headline={topic.headline}
                    key={topic.headline}
                    kindLabel={KIND_LABEL[topic.kind]}
                  />
                ))}
                {day.remainingArticles.length > 0 && (
                  <TopicItem
                    articles={day.remainingArticles}
                    headline={
                      day.picks.length === 0 && day.topics.length === 0
                        ? 'この日の記事'
                        : 'そのほかの記事'
                    }
                    kindLabel={null}
                  />
                )}
              </ul>
            </div>
          )}
        </section>
      ))}
    </div>
  );
};
