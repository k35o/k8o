import {
  incrementBlogView as _incrementBlogView,
  incrementBlogViewDaily as _incrementBlogViewDaily,
} from '../application/view';
import { incrementBlogView } from './commands';

vi.mock('../application/view', () => ({
  incrementBlogView: vi.fn(),
  incrementBlogViewDaily: vi.fn(),
}));

describe('incrementBlogView (command)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('正常系', () => {
    it('累計と日次の両方をインクリメントし、日次にはUTC基準の当日日付を渡す', async () => {
      // JST では翌日(06-24 01:00)になる時刻でも、UTC基準の日付になることを確認
      vi.setSystemTime(new Date('2026-06-23T16:00:00.000Z'));

      await incrementBlogView(42);

      expect(_incrementBlogView).toHaveBeenCalledWith(42);
      expect(_incrementBlogViewDaily).toHaveBeenCalledWith(42, '2026-06-23');
    });
  });

  describe('異常系', () => {
    it('日次集計が失敗しても throw せず、エラーをログする（best-effort）', async () => {
      vi.setSystemTime(new Date('2026-06-23T00:00:00.000Z'));
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      vi.mocked(_incrementBlogViewDaily).mockRejectedValue(new Error('boom'));

      await expect(incrementBlogView(1)).resolves.toBeUndefined();

      // 累計は影響を受けずに実行される
      expect(_incrementBlogView).toHaveBeenCalledWith(1);
      expect(consoleError).toHaveBeenCalledTimes(1);

      consoleError.mockRestore();
    });

    it('累計のインクリメントが失敗した場合は throw する（累計はsource of truth）', async () => {
      vi.setSystemTime(new Date('2026-06-23T00:00:00.000Z'));
      vi.mocked(_incrementBlogView).mockRejectedValue(new Error('db down'));

      await expect(incrementBlogView(1)).rejects.toThrow('db down');
    });
  });
});
