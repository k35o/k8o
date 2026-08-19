import { revalidateMainCache } from './revalidate-main';

const mockFetch = vi.fn() as ReturnType<typeof vi.fn>;
vi.stubGlobal('fetch', mockFetch);

describe('revalidateMainCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv(
      'MAIN_REVALIDATE_URL',
      'https://main.example.com/api/revalidate',
    );
    vi.stubEnv('REVALIDATE_SECRET', 'secret');
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('正常系', () => {
    it('mainの再検証に成功したら true を返す', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200 });

      await expect(revalidateMainCache('browser-support')).resolves.toBe(true);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://main.example.com/api/revalidate',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer secret',
          }),
          body: JSON.stringify({ tag: 'browser-support' }),
        }),
      );
    });

    it('タグ省略時は db-content タグで再検証する', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200 });

      await expect(revalidateMainCache()).resolves.toBe(true);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://main.example.com/api/revalidate',
        expect.objectContaining({
          body: JSON.stringify({ tag: 'db-content' }),
        }),
      );
    });
  });

  describe('異常系', () => {
    it('mainがエラーステータスを返したら false を返す', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });

      await expect(revalidateMainCache()).resolves.toBe(false);
    });

    it('fetch自体が失敗しても throw せず false を返す', async () => {
      mockFetch.mockRejectedValue(new Error('network error'));

      await expect(revalidateMainCache()).resolves.toBe(false);
    });
  });

  describe('エッジケース', () => {
    it('環境変数が未設定なら fetch せずに false を返す', async () => {
      vi.stubEnv('MAIN_REVALIDATE_URL', '');

      await expect(revalidateMainCache()).resolves.toBe(false);

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
