import type { PlaygroundSection } from '@playgrounds/types';

import { getBlogContents } from '@/features/blog/interface/queries';

export const getPublishedBlogSlugs = async (): Promise<ReadonlySet<string>> =>
  new Set((await getBlogContents()).map((blog) => blog.slug));

// 解説記事が公開済みで MDX のあるときだけ slug を返す。下書きの記事へは案内しない
export const blogSlugOf = (
  section: PlaygroundSection,
  publishedSlugs: ReadonlySet<string>,
): string | undefined =>
  section.type === 'blog' && publishedSlugs.has(section.slug)
    ? section.slug
    : undefined;
