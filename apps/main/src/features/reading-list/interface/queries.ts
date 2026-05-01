import { cacheLife } from 'next/cache';

import {
  getArticleSources as _getArticleSources,
  getArticles as _getArticles,
} from '../application/reading-list';

export async function getArticles() {
  'use cache';
  cacheLife('hours');

  const articles = await Promise.resolve(_getArticles());
  return articles;
}

export async function getArticleSources() {
  'use cache';
  cacheLife('hours');

  const articleSources = await Promise.resolve(_getArticleSources());
  return articleSources;
}
