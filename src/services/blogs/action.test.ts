// server-onlyをモック
vi.mock('server-only', () => ({}));

import { feedback } from './action';
import { db } from '#database/db';
import { blogComment } from '@/database/schema/blog-comment';
import { comments } from '@/database/schema/comments';
import { checkRateLimit } from '@k8o/helpers/ratelimit';

vi.mock('#database/db');
vi.mock('@k8o/helpers/ratelimit');
vi.mock('@/libs/zod', () => ({}));

describe('feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('コメントもフィードバックIDも指定されていない場合はエラーを返す', async () => {
    const result = await feedback('test-slug', null, '');

    expect(result).toEqual({
      success: false,
      message:
        'コメントまたはフィードバックIDのいずれかを入力してください',
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

  it('レート制限に引っかかった場合はエラーを返す', async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: false,
      limit: 3,
      remaining: 0,
      reset: Date.now() + 60000,
      pending: Promise.resolve({
        success: false,
        limit: 3,
        remaining: 0,
        reset: Date.now() + 60000,
      }),
    });

    const result = await feedback('test-slug', 1, 'test comment');

    expect(result).toEqual({
      success: false,
      message:
        '送信回数が上限に達しました。数分後に再度お試しください。',
    });
  });

  it('存在しないブログスラッグの場合はエラーを返す', async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: true,
      limit: 3,
      remaining: 2,
      reset: Date.now() + 60000,
      pending: Promise.resolve({
        success: true,
        limit: 3,
        remaining: 2,
        reset: Date.now() + 60000,
      }),
    });
    vi.mocked(db.query.blogs.findFirst).mockResolvedValue(undefined);

    const result = await feedback(
      'non-existent-slug',
      1,
      'test comment',
    );

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

    vi.mocked(checkRateLimit).mockResolvedValue({
      success: true,
      limit: 3,
      remaining: 2,
      reset: Date.now() + 60000,
      pending: Promise.resolve({
        success: true,
        limit: 3,
        remaining: 2,
        reset: Date.now() + 60000,
      }),
    });
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
    expect(db.insert).toHaveBeenCalledWith(comments);
    expect(db.insert).toHaveBeenCalledWith(blogComment);
  });

  it('フィードバックIDなしでコメントのみの場合も正常に動作する', async () => {
    const mockBlog = {
      id: 1,
      slug: 'test-slug',
      published: true,
      createdAt: new Date(),
    };
    const mockInsertResult = [{ insertedId: 123 }];

    vi.mocked(checkRateLimit).mockResolvedValue({
      success: true,
      limit: 3,
      remaining: 2,
      reset: Date.now() + 60000,
      pending: Promise.resolve({
        success: true,
        limit: 3,
        remaining: 2,
        reset: Date.now() + 60000,
      }),
    });
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
