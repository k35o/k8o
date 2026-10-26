import { db } from '@repo/database';
import { describe, expect, it, vi } from 'vitest';

import { findPublishedBlogRow, findPublishedBlogRows } from './blog-repository';

vi.mock('@repo/database', () => ({
  db: {
    query: {
      blogs: {
        findFirst: vi.fn(),
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
