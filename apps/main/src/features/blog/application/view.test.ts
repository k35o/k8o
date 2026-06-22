import { db } from '@repo/database';

import { incrementBlogView, incrementBlogViewDaily } from './view';

vi.mock('@repo/database', () => ({
  db: {
    insert: vi.fn(),
    _schema: {
      blogViews: {
        views: 'blogViews.views',
        blogId: 'blogViews.blogId',
      },
      blogViewDailies: {
        views: 'blogViewDailies.views',
        blogId: 'blogViewDailies.blogId',
        date: 'blogViewDailies.date',
      },
    },
    _utils: {
      increment: vi.fn(),
    },
  },
}));

// db.insert(...).values(...).onConflictDoUpdate(...) のチェーンをモックするヘルパー
const mockInsertChain = (resolvedValue: unknown) => {
  const onConflictDoUpdate = vi.fn().mockResolvedValue(resolvedValue);
  const values = vi.fn().mockReturnValue({ onConflictDoUpdate });
  vi.mocked(db.insert).mockReturnValue({
    values,
  } as unknown as ReturnType<typeof db.insert>);
  return { values, onConflictDoUpdate };
};

describe('view service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('incrementBlogView', () => {
    it('累計ビュー数を upsert でインクリメントできる', async () => {
      vi.mocked(db._utils.increment).mockReturnValue(
        'INCREMENTED' as unknown as ReturnType<typeof db._utils.increment>,
      );
      const { values, onConflictDoUpdate } = mockInsertChain(true);

      const result = await incrementBlogView(1);

      expect(db.insert).toHaveBeenCalledWith(db._schema.blogViews);
      expect(values).toHaveBeenCalledWith({ blogId: 1, views: 1 });
      expect(db._utils.increment).toHaveBeenCalledWith(
        db._schema.blogViews.views,
      );
      expect(onConflictDoUpdate).toHaveBeenCalledWith({
        target: db._schema.blogViews.blogId,
        set: { views: 'INCREMENTED' },
      });
      expect(result).toBe(true);
    });

    it('異なるブログIDでも正しく動作する', async () => {
      vi.mocked(db._utils.increment).mockReturnValue(
        'INCREMENTED' as unknown as ReturnType<typeof db._utils.increment>,
      );
      const { values } = mockInsertChain(true);

      await incrementBlogView(999);

      expect(values).toHaveBeenCalledWith({ blogId: 999, views: 1 });
    });
  });

  describe('incrementBlogViewDaily', () => {
    it('日次ビュー数を (blogId, date) 単位で upsert できる', async () => {
      vi.mocked(db._utils.increment).mockReturnValue(
        'INCREMENTED' as unknown as ReturnType<typeof db._utils.increment>,
      );
      const { values, onConflictDoUpdate } = mockInsertChain(true);

      const result = await incrementBlogViewDaily(1, '2026-06-22');

      expect(db.insert).toHaveBeenCalledWith(db._schema.blogViewDailies);
      expect(values).toHaveBeenCalledWith({
        blogId: 1,
        date: '2026-06-22',
        views: 1,
      });
      expect(db._utils.increment).toHaveBeenCalledWith(
        db._schema.blogViewDailies.views,
      );
      expect(onConflictDoUpdate).toHaveBeenCalledWith({
        target: [
          db._schema.blogViewDailies.blogId,
          db._schema.blogViewDailies.date,
        ],
        set: { views: 'INCREMENTED' },
      });
      expect(result).toBe(true);
    });
  });
});
