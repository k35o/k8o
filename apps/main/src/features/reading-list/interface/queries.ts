import { cacheLife } from 'next/cache';
import {
  getArticleSources as _getArticleSources,
  getArticles as _getArticles,
} from '../application/reading-list';

export async function getArticles() {
  'use cache';
  cacheLife('hours');

  return await _getArticles();
}

export async function getArticleSources() {
  'use cache';
  cacheLife('hours');

  return await _getArticleSources();
}
