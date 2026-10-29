import { db } from '@repo/database';
import { describe, expect, it, vi } from 'vitest';

import { findTagRow, findTagRows } from './tag-repository';

vi.mock('@repo/database', () => ({
  db: {
    query: {
      tags: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
  },
}));

describe('findTagRows', () => {
  describe('正常系', () => {
    it('件数の上限も絞り込みも付けずに、全タグを引く', async () => {
      // /tags/:id の paths が、中身が 0 件のタグを含む全タグを前提にする
      vi.mocked(db.query.tags.findMany).mockResolvedValue([]);

      await findTagRows();

      expect(db.query.tags.findMany).toHaveBeenCalledWith(
        expect.not.objectContaining({ limit: expect.anything() }),
      );
      expect(db.query.tags.findMany).toHaveBeenCalledWith(
        expect.not.objectContaining({ where: expect.anything() }),
      );
    });

    it('名前の順に並べる', async () => {
      vi.mocked(db.query.tags.findMany).mockResolvedValue([]);

      await findTagRows();

      const orderBy = vi.mocked(db.query.tags.findMany).mock.lastCall?.[0]
        ?.orderBy as unknown as (
        fields: { name: string },
        ops: { asc: (column: unknown) => unknown },
      ) => unknown;
      expect(
        orderBy(
          { name: 'name-column' },
          { asc: (column) => ({ asc: column }) },
        ),
      ).toStrictEqual({ asc: 'name-column' });
    });
  });
});

describe('findTagRow', () => {
  describe('正常系', () => {
    it('id でタグを引く', async () => {
      vi.mocked(db.query.tags.findFirst).mockResolvedValue(undefined);

      await findTagRow(42);

      const where = vi.mocked(db.query.tags.findFirst).mock.lastCall?.[0]
        ?.where as unknown as (
        fields: { id: string },
        ops: { eq: (column: unknown, value: unknown) => unknown },
      ) => unknown;
      expect(
        where(
          { id: 'id-column' },
          { eq: (column, value) => ({ eq: [column, value] }) },
        ),
      ).toStrictEqual({ eq: ['id-column', 42] });
    });
  });
});
