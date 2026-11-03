import { afterEach, describe, expect, it, vi } from 'vitest';

import { memoizeInBuild } from './memoize-in-build';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('memoizeInBuild', () => {
  describe('正常系', () => {
    it('ビルドでは、同じ引数の2回目は読み直さずに同じ値を返す', async () => {
      vi.stubEnv('DEV', false);
      const load = vi.fn((slug: string) => Promise.resolve({ slug }));
      const read = memoizeInBuild(load);

      const first = await read('abs-sign');
      const second = await read('abs-sign');

      expect(second).toBe(first);
      expect(load).toHaveBeenCalledTimes(1);
    });

    it('ビルドでも、引数が違えばそれぞれ読む', async () => {
      vi.stubEnv('DEV', false);
      const load = vi.fn((slug: string) => Promise.resolve({ slug }));
      const read = memoizeInBuild(load);

      await read('abs-sign');
      const other = await read('at-rule');

      expect(other).toStrictEqual({ slug: 'at-rule' });
      expect(load).toHaveBeenCalledTimes(2);
    });

    it('vite dev では、ファイルを直したあとの値を返せるよう毎回読み直す', async () => {
      vi.stubEnv('DEV', true);
      const load = vi.fn((slug: string) => Promise.resolve({ slug }));
      const read = memoizeInBuild(load);

      await read('abs-sign');
      await read('abs-sign');

      expect(load).toHaveBeenCalledTimes(2);
    });
  });

  describe('エッジケース', () => {
    it('ビルドでは、読み終わる前の2回目も同じ読み込みを待つ', async () => {
      vi.stubEnv('DEV', false);
      const load = vi.fn(() => Promise.resolve(['abs-sign']));
      const read = memoizeInBuild(load);

      const [first, second] = await Promise.all([read(), read()]);

      expect(second).toBe(first);
      expect(load).toHaveBeenCalledTimes(1);
    });

    it('ビルドでは、文字列にすると同じになる引数も別に読む', async () => {
      vi.stubEnv('DEV', false);
      const load = vi.fn((id: string | number) => Promise.resolve(id));
      const read = memoizeInBuild(load);

      await read(1);
      await read('1');

      expect(load).toHaveBeenCalledTimes(2);
    });
  });
});
