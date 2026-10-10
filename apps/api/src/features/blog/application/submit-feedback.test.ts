import { insertBlogFeedback } from '../infrastructure/feedback-repository';
import { findPublishedBlogId } from '../infrastructure/view-repository';
import { submitBlogFeedback } from './submit-feedback';

vi.mock('../infrastructure/feedback-repository', () => ({
  insertBlogFeedback: vi.fn(),
}));
vi.mock('../infrastructure/view-repository', () => ({
  findPublishedBlogId: vi.fn(),
}));

describe('submitBlogFeedback', () => {
  beforeEach(() => {
    vi.mocked(insertBlogFeedback).mockResolvedValue();
  });

  describe('正常系', () => {
    it('公開済みの記事に紐付けて保存する', async () => {
      vi.mocked(findPublishedBlogId).mockResolvedValue(7);

      await expect(
        submitBlogFeedback('media-pseudos', { feedbackId: 1, comment: '良い' }),
      ).resolves.toBe('submitted');

      expect(insertBlogFeedback).toHaveBeenCalledWith({
        blogId: 7,
        feedbackId: 1,
        message: '良い',
      });
    });
  });

  describe('異常系', () => {
    it('公開済みの記事が無ければ保存しない', async () => {
      vi.mocked(findPublishedBlogId).mockResolvedValue(null);

      await expect(
        submitBlogFeedback('draft', { feedbackId: 1, comment: '' }),
      ).resolves.toBe('not_found');

      expect(insertBlogFeedback).not.toHaveBeenCalled();
    });
  });

  describe('エッジケース', () => {
    it('空のコメントは null で保存する', async () => {
      vi.mocked(findPublishedBlogId).mockResolvedValue(7);

      await submitBlogFeedback('media-pseudos', { feedbackId: 2, comment: '' });

      expect(insertBlogFeedback).toHaveBeenCalledWith({
        blogId: 7,
        feedbackId: 2,
        message: null,
      });
    });
  });
});
