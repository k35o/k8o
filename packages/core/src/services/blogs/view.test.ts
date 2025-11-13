import { eq } from 'drizzle-orm';
import { db } from '@/database/db';
import { blogViews } from '@/database/schema/blog-views';
import { increment } from '@/database/utils';
import { getBlogView, incrementBlogView } from './view';

vi.mock('@/database/db', () => ({
  db: {
    query: {
      blogViews: {
        findFirst: vi.fn(),
      },
    },
    update: vi.fn(),
  },
}));
vi.mock('@/database/utils');
vi.mock('drizzle-orm');

describe('view service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBlogView', () => {
    it('ブログの閲覧数を取得できる', async () => {
      const mockViewData = { views: 123 };
      const mockFindFirst = vi.fn().mockResolvedValue(mockViewData);

      vi.mocked(db.query.blogViews.findFirst).mockImplementation(mockFindFirst);

      const result = await getBlogView(1);

      expect(result).toBe(123);
      expect(mockFindFirst).toHaveBeenCalledTimes(1);
    });

    it('閲覧数データが存在しない場合は0を返す', async () => {
      const mockFindFirst = vi.fn().mockResolvedValue(null);

      vi.mocked(db.query.blogViews.findFirst).mockImplementation(mockFindFirst);

      const result = await getBlogView(1);

      expect(result).toBe(0);
    });

    it('viewsプロパティがundefinedの場合は0を返す', async () => {
      const mockViewData = { views: undefined };
      const mockFindFirst = vi.fn().mockResolvedValue(mockViewData);

      vi.mocked(db.query.blogViews.findFirst).mockImplementation(mockFindFirst);

      const result = await getBlogView(1);

      expect(result).toBe(0);
    });
  });

  describe('incrementBlogView', () => {
    it('ブログの閲覧数をインクリメントできる', async () => {
      const mockIncrement = vi.fn().mockReturnValue('INCREMENTED_VALUE');
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(true),
        }),
      });
      const mockEq = vi.fn().mockReturnValue('WHERE_CONDITION');

      vi.mocked(increment).mockImplementation(mockIncrement);
      vi.mocked(db.update).mockImplementation(mockUpdate);
      vi.mocked(eq).mockImplementation(mockEq);

      const result = await incrementBlogView(1);

      expect(db.update).toHaveBeenCalledWith(blogViews);
      expect(mockIncrement).toHaveBeenCalledWith(blogViews.views);
      expect(mockEq).toHaveBeenCalledWith(blogViews.blogId, 1);
      expect(result).toBe(true);
    });

    it('異なるブログIDでも正しく動作する', async () => {
      const mockIncrement = vi.fn().mockReturnValue('INCREMENTED_VALUE');
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(true),
        }),
      });
      const mockEq = vi.fn().mockReturnValue('WHERE_CONDITION');

      vi.mocked(increment).mockImplementation(mockIncrement);
      vi.mocked(db.update).mockImplementation(mockUpdate);
      vi.mocked(eq).mockImplementation(mockEq);

      await incrementBlogView(999);

      expect(mockEq).toHaveBeenCalledWith(blogViews.blogId, 999);
    });
  });
});
