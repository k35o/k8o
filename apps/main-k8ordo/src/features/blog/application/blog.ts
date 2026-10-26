import { findFrontmatter } from '@repo/helpers/mdx/frontmatter';
import type { Frontmatter } from '@repo/helpers/mdx/frontmatter';

import { findPublishedBlogRow } from '../infrastructure/blog-repository';
import { blogPath } from './path';

export const findBlog = async (slug: string) => {
  const blog = await findPublishedBlogRow(slug);

  if (!blog) {
    return null;
  }

  return {
    id: blog.id,
    slug: blog.slug,
    tags: blog.blogTag.map((blogTag) => ({
      id: blogTag.tag.id,
      name: blogTag.tag.name,
    })),
    slideUrl: blog.talks[0]?.slideUrl,
  };
};

// DBのslugに対応するMDXが無いことがある（共有ローカルDBに他worktreeの
// 執筆中記事のslugが混ざる、公開のマイグレーションが記事を含むデプロイより先に本番のDBに入る等）。
// その記事を無いもの（一覧から外し、詳細・OG・.md は404）として扱えるよう、ファイル欠損はエラーにせずnullで返す。
export const findBlogMetadata = async (
  slug: string,
): Promise<Frontmatter | null> => {
  const metadata = await findFrontmatter(blogPath(slug));
  if (metadata === null) {
    console.warn(
      `ブログ "${slug}" のMDXファイルが存在しないため、記事が無いものとして扱います`,
    );
  }
  return metadata;
};
