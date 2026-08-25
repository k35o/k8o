import { submitFeedback } from '../application/submit-feedback';
import { feedback } from './actions';

// factory 無しの automock は実モジュールを読み込み、@repo/database の
// クライアント生成まで走ってしまうため factory で置き換える。
vi.mock('../application/submit-feedback', () => ({
  submitFeedback: vi.fn(),
}));
vi.mock('@/shared/validation/zod', () => ({
  configureZod: vi.fn(),
}));

describe('feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('正常系', () => {
    it('validationを通過した入力をsubmitFeedbackへそのまま渡す', async () => {
      vi.mocked(submitFeedback).mockResolvedValue({ success: true });

      const result = await feedback('test-slug', 1, 'test comment');

      expect(result).toStrictEqual({ success: true });
      expect(submitFeedback).toHaveBeenCalledWith(
        'test-slug',
        1,
        'test comment',
      );
    });

    it('フィードバックIDなしでコメントのみの場合も送信できる', async () => {
      vi.mocked(submitFeedback).mockResolvedValue({ success: true });

      const result = await feedback('test-slug', null, 'test comment');

      expect(result).toStrictEqual({ success: true });
      expect(submitFeedback).toHaveBeenCalledWith(
        'test-slug',
        null,
        'test comment',
      );
    });
  });

  describe('異常系', () => {
    it('コメントもフィードバックIDも指定されていない場合はエラーを返す', async () => {
      const result = await feedback('test-slug', null, '');

      expect(result).toStrictEqual({
        success: false,
        message: 'コメントまたはフィードバックIDのいずれかを入力してください',
      });
      expect(submitFeedback).not.toHaveBeenCalled();
    });

    it('コメントが500文字を超える場合はエラーを返す', async () => {
      const longComment = 'a'.repeat(501);
      const result = await feedback('test-slug', 1, longComment);

      expect(result).toStrictEqual({
        success: false,
        message: 'コメントは500文字以内で入力してください',
      });
      expect(submitFeedback).not.toHaveBeenCalled();
    });

    it('submitFeedbackの失敗はそのまま返す', async () => {
      vi.mocked(submitFeedback).mockResolvedValue({
        success: false,
        message: '指定されたブログが見つかりません',
      });

      const result = await feedback('non-existent-slug', 1, 'test comment');

      expect(result).toStrictEqual({
        success: false,
        message: '指定されたブログが見つかりません',
      });
    });
  });
});
