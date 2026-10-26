import { db } from '@repo/database';
import { describe, expect, it, vi } from 'vitest';

import { findPublishedSlideRows } from './slide-repository';

vi.mock('@repo/database', () => ({
  db: {
    query: {
      slides: {
        findMany: vi.fn(),
      },
    },
  },
}));

type Where = (
  fields: { published: string },
  ops: { eq: (column: unknown, value: unknown) => unknown },
) => unknown;

describe('findPublishedSlideRows', () => {
  describe('正常系', () => {
    it('公開済みのスライドだけを引く', async () => {
      vi.mocked(db.query.slides.findMany).mockResolvedValue([]);

      await findPublishedSlideRows();

      const where = vi.mocked(db.query.slides.findMany).mock.calls[0]?.[0]
        ?.where as unknown as Where;
      const eq = vi.fn((column: unknown, value: unknown) => ({
        column,
        value,
      }));
      where({ published: 'published-column' }, { eq });
      expect(eq.mock.calls).toStrictEqual([['published-column', true]]);
    });

    it('件数の上限を付けずに全件を引く', async () => {
      // サイトマップとフィードが全件を前提にする
      vi.mocked(db.query.slides.findMany).mockResolvedValue([]);

      await findPublishedSlideRows();

      expect(db.query.slides.findMany).toHaveBeenCalledWith(
        expect.not.objectContaining({ limit: expect.anything() }),
      );
    });
  });
});
