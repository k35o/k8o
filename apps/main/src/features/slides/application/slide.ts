import { findFrontmatter } from '@repo/helpers/mdx/frontmatter';
import type { Frontmatter } from '@repo/helpers/mdx/frontmatter';

import { slidePath } from './path';

// blogのfindBlogMetadataと同じ理由で、MDX欠損を一覧系でスキップできるようnullで返す
export const findSlideMetadata = async (
  slug: string,
): Promise<Frontmatter | null> => {
  const metadata = await findFrontmatter(slidePath(slug));
  if (metadata === null) {
    console.warn(
      `スライド "${slug}" のMDXファイルが存在しないため一覧から除外します`,
    );
  }
  return metadata;
};
