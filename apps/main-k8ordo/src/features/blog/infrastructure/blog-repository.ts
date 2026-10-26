import { db } from '@repo/database';

// 未公開の記事は URL 直打ちでも見せない（published は一覧だけでなく詳細にも効く）
export const findPublishedBlogRow = async (slug: string) =>
  db.query.blogs.findFirst({
    where: (blogFields, { and, eq }) =>
      and(eq(blogFields.slug, slug), eq(blogFields.published, true)),
    with: {
      blogTag: {
        with: {
          tag: true,
        },
      },
      talks: true,
    },
  });

export const findPublishedBlogRows = async () =>
  db.query.blogs.findMany({
    with: {
      blogTag: {
        with: {
          tag: true,
        },
      },
    },
    where: (blogFields, { eq }) => eq(blogFields.published, true),
    orderBy(fields, operators) {
      return [operators.desc(fields.createdAt), operators.desc(fields.id)];
    },
  });
