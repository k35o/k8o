import { db } from '@repo/database';
import { feedback } from './action';

vi.mock('@repo/database', () => ({
  db: {
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
    _schema: {
      comments: {
        id: 'comments.id',
      },
      blogComment: {},
    },
  },
}));
vi.mock('@/libs/zod', () => ({}));

describe('feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('コメントもフィードバックIDも指定されていない場合はエラーを返す', async () => {
    const result = await feedback('test-slug', null, '');

    expect(result).toEqual({
      success: false,
      message: 'コメントまたはフィードバックIDのいずれかを入力してください',
    });
  });

  it('コメントが500文字を超える場合はエラーを返す', async () => {
    const longComment = 'a'.repeat(501);
    const result = await feedback('test-slug', 1, longComment);

    expect(result).toEqual({
      success: false,
      message: 'コメントは500文字以内で入力してください',
    });
  });

  it('存在しないブログスラッグの場合はエラーを返す', async () => {
    vi.mocked(db.query.blogs.findFirst).mockResolvedValue(undefined);

    const result = await feedback('non-existent-slug', 1, 'test comment');

    expect(result).toEqual({
      success: false,
      message: '指定されたブログが見つかりません',
    });
  });

  it('正常にフィードバックが送信される', async () => {
    const mockBlog = {
      id: 1,
      slug: 'test-slug',
      published: true,
      createdAt: new Date(),
    };
    const mockInsertResult = [{ insertedId: 123 }];

    vi.mocked(db.query.blogs.findFirst).mockResolvedValue(mockBlog);
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue(mockInsertResult),
      }),
    } as unknown as ReturnType<typeof db.insert>);

    const result = await feedback('test-slug', 1, 'test comment');

    expect(result).toEqual({
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
      createdAt: new Date(),
    };
    const mockInsertResult = [{ insertedId: 123 }];

    vi.mocked(db.query.blogs.findFirst).mockResolvedValue(mockBlog);
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue(mockInsertResult),
      }),
    } as unknown as ReturnType<typeof db.insert>);

    const result = await feedback('test-slug', null, 'test comment');

    expect(result).toEqual({
      success: true,
    });
  });
});
