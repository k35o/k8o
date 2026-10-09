import {
  findPublishedBlogId,
  incrementBlogView,
  incrementBlogViewDaily,
} from '../infrastructure/view-repository';
import { countBlogView } from './count-view';

vi.mock('../infrastructure/view-repository', () => ({
  findPublishedBlogId: vi.fn(),
  incrementBlogView: vi.fn(),
  incrementBlogViewDaily: vi.fn(),
}));

describe('countBlogView', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-09T23:30:00.000Z'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(incrementBlogView).mockResolvedValue();
    vi.mocked(incrementBlogViewDaily).mockResolvedValue();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('正常系', () => {
    it('公開済みの記事の累計と、UTC の日付ごとの閲覧数を増やす', async () => {
      // 日本時間ではもう翌日になる時刻で、日付を UTC で数えることを確かめる
      vi.stubEnv('TZ', 'Asia/Tokyo');
      vi.mocked(findPublishedBlogId).mockResolvedValue(7);

      await expect(countBlogView('media-pseudos')).resolves.toBe('counted');

      expect(findPublishedBlogId).toHaveBeenCalledWith('media-pseudos');
      expect(incrementBlogView).toHaveBeenCalledWith(7);
      expect(incrementBlogViewDaily).toHaveBeenCalledWith(7, '2026-10-09');
    });
  });

  describe('異常系', () => {
    it('公開済みの記事が無ければ数えない', async () => {
      vi.mocked(findPublishedBlogId).mockResolvedValue(null);

      await expect(countBlogView('draft')).resolves.toBe('not_found');

      expect(incrementBlogView).not.toHaveBeenCalled();
      expect(incrementBlogViewDaily).not.toHaveBeenCalled();
    });

    it('累計を増やせなければ失敗にする', async () => {
      vi.mocked(findPublishedBlogId).mockResolvedValue(7);
      vi.mocked(incrementBlogView).mockRejectedValue(new Error('db'));

      await expect(countBlogView('media-pseudos')).rejects.toThrow('db');
    });
  });

  describe('エッジケース', () => {
    it('日次の集計に失敗しても、累計を数えられれば成功にする', async () => {
      vi.mocked(findPublishedBlogId).mockResolvedValue(7);
      vi.mocked(incrementBlogViewDaily).mockRejectedValue(new Error('db'));

      await expect(countBlogView('media-pseudos')).resolves.toBe('counted');
      expect(console.error).toHaveBeenCalledOnce();
    });
  });
});
