import { db } from '@repo/database';
import { describe, expect, it, vi } from 'vitest';

import {
  findPublishedBlogRow,
  findPublishedBlogRows,
  findPublishedBlogRowsByTags,
} from './blog-repository';

vi.mock('@repo/database', () => ({
  db: {
    query: {
      blogs: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      blogTag: {
        findMany: vi.fn(),
      },
    },
  },
}));

type Where = (
  fields: { slug: string; published: string },
  ops: {
    and: (...conditions: unknown[]) => unknown;
    eq: (column: unknown, value: unknown) => unknown;
  },
) => unknown;

const conditionsOf = (where: Where): unknown[] => {
  const eq = vi.fn((column: unknown, value: unknown) => ({ column, value }));
  const and = vi.fn((...conditions: unknown[]) => conditions);
  where({ slug: 'slug-column', published: 'published-column' }, { and, eq });
  return eq.mock.calls;
};

describe('findPublishedBlogRow', () => {
  describe('正常系', () => {
    it('公開済みの記事だけを slug で引く', async () => {
      vi.mocked(db.query.blogs.findFirst).mockResolvedValue(undefined);

      await findPublishedBlogRow('draft-slug');

      const where = vi.mocked(db.query.blogs.findFirst).mock.calls[0]?.[0]
        ?.where as unknown as Where;
      expect(conditionsOf(where)).toStrictEqual([
        ['slug-column', 'draft-slug'],
        ['published-column', true],
      ]);
    });
  });
});

describe('findPublishedBlogRows', () => {
  describe('正常系', () => {
    it('公開済みの記事だけを引く', async () => {
      vi.mocked(db.query.blogs.findMany).mockResolvedValue([]);

      await findPublishedBlogRows();

      const where = vi.mocked(db.query.blogs.findMany).mock.calls[0]?.[0]
        ?.where as unknown as Where;
      expect(conditionsOf(where)).toStrictEqual([['published-column', true]]);
    });

    it('件数の上限を付けずに全件を引く', async () => {
      // フィード・サイトマップ・llms.txt と、記事の下の paths が全件を前提にする
      vi.mocked(db.query.blogs.findMany).mockResolvedValue([]);

      await findPublishedBlogRows();

      expect(db.query.blogs.findMany).toHaveBeenCalledWith(
        expect.not.objectContaining({ limit: expect.anything() }),
      );
    });
  });
});

describe('findPublishedBlogRowsByTags', () => {
  const ops = {
    and: (...conditions: unknown[]) => ({ and: conditions }),
    not: (condition: unknown) => ({ not: condition }),
    eq: (column: unknown, value: unknown) => ({ eq: [column, value] }),
    inArray: (column: unknown, values: unknown) => ({
      inArray: [column, values],
    }),
  };

  type OpsWhere = (
    fields: Record<string, string>,
    operators: typeof ops,
  ) => unknown;

  describe('正常系', () => {
    it('タグのどれかを持つ記事のうち、slug の記事を除いた公開済みの記事を引く', async () => {
      vi.mocked(db.query.blogTag.findMany).mockResolvedValue([
        { blogId: 3 },
        { blogId: 4 },
      ] as never);
      vi.mocked(db.query.blogs.findMany).mockResolvedValue([]);

      await findPublishedBlogRowsByTags('current-slug', [1, 2]);

      const tagWhere = vi.mocked(db.query.blogTag.findMany).mock.lastCall?.[0]
        ?.where as unknown as OpsWhere;
      expect(tagWhere({ tagId: 'tag-id-column' }, ops)).toStrictEqual({
        inArray: ['tag-id-column', [1, 2]],
      });
      const blogWhere = vi.mocked(db.query.blogs.findMany).mock.lastCall?.[0]
        ?.where as unknown as OpsWhere;
      expect(
        blogWhere(
          {
            slug: 'slug-column',
            id: 'id-column',
            published: 'published-column',
          },
          ops,
        ),
      ).toStrictEqual({
        and: [
          { not: { eq: ['slug-column', 'current-slug'] } },
          { inArray: ['id-column', [3, 4]] },
          { eq: ['published-column', true] },
        ],
      });
    });
  });
});
