import { db } from '@repo/database';
import { findFrontmatter, getFrontmatter } from '@repo/helpers/mdx/frontmatter';
import type { Frontmatter } from '@repo/helpers/mdx/frontmatter';

import { slidePath } from './path';

export const getSlide = async (slug: string) => {
  const slide = await db.query.slides.findFirst({
    where: (slideFields, { eq }) => eq(slideFields.slug, slug),
    with: {
      slideTag: {
        with: {
          tag: true,
        },
      },
    },
  });

  if (!slide) {
    throw new Error(`Slide not found: ${slug}`);
  }

  return {
    id: slide.id,
    slug: slide.slug,
    tags: slide.slideTag.map((slideTag) => ({
      id: slideTag.tag.id,
      name: slideTag.tag.name,
    })),
  };
};

export const getSlideMetadata = (slug: string) =>
  getFrontmatter(slidePath(slug));

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
