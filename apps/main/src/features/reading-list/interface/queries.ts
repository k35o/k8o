import { DB_CONTENT_CACHE_TAG } from '@repo/helpers/cache/main-cache-tags';
import { cacheLife, cacheTag } from 'next/cache';

import {
  getArticleSources as _getArticleSources,
  getArticles as _getArticles,
} from '../application/reading-list';

export async function getArticles() {
  'use cache';
  cacheLife('hours');
  cacheTag(DB_CONTENT_CACHE_TAG);

  const articles = await _getArticles();
  return articles;
}

export async function getArticleSources() {
  'use cache';
  cacheLife('hours');
  cacheTag(DB_CONTENT_CACHE_TAG);

  const articleSources = await _getArticleSources();
  return articleSources;
}
