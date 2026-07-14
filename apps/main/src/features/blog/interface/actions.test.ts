import { db } from '@repo/database';

import { feedback } from './actions';

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
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn(),
        }),
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
vi.mock('@/shared/validation/zod', () => ({
  configureZod: vi.fn(),
}));

describe('feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('コメントもフィードバックIDも指定されていない場合はエラーを返す', async () => {
    const result = await feedback('test-slug', null, '');

    expect(result).toStrictEqual({
      success: false,
      message: 'コメントまたはフィードバックIDのいずれかを入力してください',
    });
  });

  it('コメントが500文字を超える場合はエラーを返す', async () => {
    const longComment = 'a'.repeat(501);
    const result = await feedback('test-slug', 1, longComment);

    expect(result).toStrictEqual({
      success: false,
      message: 'コメントは500文字以内で入力してください',
    });
  });

  it('存在しないブログスラッグの場合はエラーを返す', async () => {
    vi.mocked(db.query.blogs.findFirst).mockResolvedValue(undefined);

    const result = await feedback('non-existent-slug', 1, 'test comment');

    expect(result).toStrictEqual({
      success: false,
      message: '指定されたブログが見つかりません',
    });
  });

  it('正常にフィードバックが送信される', async () => {
    const mockBlog = {
      id: 1,
      slug: 'test-slug',
      published: true,
      createdAt: new Date().toISOString(),
    };
    const mockInsertResult = [{ insertedId: 123 }];

    vi.mocked(db.query.blogs.findFirst).mockResolvedValue(mockBlog);
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue(mockInsertResult),
      }),
    } as unknown as ReturnType<typeof db.insert>);

    const result = await feedback('test-slug', 1, 'test comment');

    expect(result).toStrictEqual({
      success: true,
    });
    expect(db.insert).toHaveBeenCalledWith(db._schema.comments);
    expect(db.insert).toHaveBeenCalledWith(db._schema.blogComment);
  });

  it('フィードバックIDなしでコメントのみの場合も正常に動作する', async () => {
    const mockBlog = {
      id: 1,
      slug: 'test-slug',
      published: true,
      createdAt: new Date().toISOString(),
    };
    const mockInsertResult = [{ insertedId: 123 }];

    vi.mocked(db.query.blogs.findFirst).mockResolvedValue(mockBlog);
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue(mockInsertResult),
      }),
    } as unknown as ReturnType<typeof db.insert>);

    const result = await feedback('test-slug', null, 'test comment');

    expect(result).toStrictEqual({
      success: true,
    });
  });
});
