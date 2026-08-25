import { db } from '@repo/database';

import { submitFeedback } from './submit-feedback';

vi.mock('@repo/database', () => {
  const mockDb = {
    query: {
      blogs: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn(),
      }),
    }),
    // submitFeedback は transaction で囲う。tx として db 自身を渡し、既存の
    // db.insert モック・アサーションをそのまま活かす。
    transaction: vi.fn((cb: (tx: typeof mockDb) => unknown) => cb(mockDb)),
    _schema: {
      comments: {
        id: 'comments.id',
      },
      blogComment: {},
    },
  };
  return { db: mockDb };
});

const mockBlog = {
  id: 1,
  slug: 'test-slug',
  published: true,
  createdAt: new Date().toISOString(),
};

const mockInsertSuccess = (): void => {
  vi.mocked(db.insert).mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ insertedId: 123 }]),
    }),
  } as unknown as ReturnType<typeof db.insert>);
};

describe('submitFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('正常系', () => {
    it('コメントとblog紐付けをtransactionで原子的に挿入する', async () => {
      vi.mocked(db.query.blogs.findFirst).mockResolvedValue(mockBlog);
      mockInsertSuccess();

      const result = await submitFeedback('test-slug', 1, 'test comment');

      expect(result).toStrictEqual({ success: true });
      expect(db.transaction).toHaveBeenCalledOnce();
      expect(db.insert).toHaveBeenCalledWith(db._schema.comments);
      expect(db.insert).toHaveBeenCalledWith(db._schema.blogComment);
    });

    it('フィードバックIDなしでコメントのみの場合も送信できる', async () => {
      vi.mocked(db.query.blogs.findFirst).mockResolvedValue(mockBlog);
      mockInsertSuccess();

      const result = await submitFeedback('test-slug', null, 'test comment');

      expect(result).toStrictEqual({ success: true });
    });
  });

  describe('異常系', () => {
    it('存在しないブログスラッグの場合はエラーを返す', async () => {
      vi.mocked(db.query.blogs.findFirst).mockResolvedValue(undefined);

      const result = await submitFeedback(
        'non-existent-slug',
        1,
        'test comment',
      );

      expect(result).toStrictEqual({
        success: false,
        message: '指定されたブログが見つかりません',
      });
      expect(db.transaction).not.toHaveBeenCalled();
    });
  });
});
