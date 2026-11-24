import { findArticleSources } from '../infrastructure/reading-list-repository';
import type { ArticleSource } from '../infrastructure/reading-list-repository';

export const listArticleSources = async (): Promise<{
  sources: ArticleSource[];
}> => ({ sources: await findArticleSources() });
