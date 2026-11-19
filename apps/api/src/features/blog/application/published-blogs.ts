import { fetchPublishedBlogs } from '../infrastructure/main-blog-source';
import type { BlogEntry } from '../infrastructure/main-blog-source';
import { BLOG_SLUG_PATTERN } from './blog-slug';

// 公開していない記事と、main に本文の無い記事は null
export { fetchBlogMarkdown as getPublishedBlogMarkdown } from '../infrastructure/main-blog-source';

export const listPublishedBlogs = async (): Promise<BlogEntry[]> => {
  const blogs = await fetchPublishedBlogs();
  return blogs.filter(({ slug }) => BLOG_SLUG_PATTERN.test(slug));
};
