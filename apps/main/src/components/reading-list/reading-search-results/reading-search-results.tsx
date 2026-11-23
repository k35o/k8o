'use client';

import type { FC } from 'react';

import type { ReadingArticle } from '../reading-list-source/reading-list-source';
import { ReadingRow } from '../reading-row/reading-row';
import { useShownCount } from './use-shown-count';

import styles from './reading-search-results.module.css';

// 検索に当たった記事を、公開日を添えて渡された順に並べる
export const ReadingSearchResults: FC<{
  articles: readonly ReadingArticle[];
}> = ({ articles }) => {
  const shownCount = useShownCount(articles.length);
  return (
    <ul className={styles.root}>
      {articles.slice(0, shownCount).map((article) => (
        <ReadingRow article={article} key={article.id} showsDate />
      ))}
    </ul>
  );
};
