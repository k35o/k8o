import { findArticleSources } from '../infrastructure/reading-list-repository';
import type { ArticleSource } from '../infrastructure/reading-list-repository';

export { ARTICLE_SOURCE_TYPES } from '@repo/database/schema';

export const listArticleSources = async (): Promise<{
  sources: ArticleSource[];
}> => ({ sources: await findArticleSources() });
