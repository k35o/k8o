import { resolveServeWithCooldown } from './serve-cooldown';

// 注: モジュール内 Map は状態を持つため、テストごとに一意の slug を使う。

describe('resolveServeWithCooldown', () => {
  describe('正常系', () => {
    it('TTL 内の連続呼び出しは serve を1回だけ呼び、キャッシュ URL を返す', async () => {
      let calls = 0;
      const serve = (): Promise<string> => {
        calls += 1;
        return Promise.resolve(`url-${calls.toString()}`);
      };
      const first = await resolveServeWithCooldown('slug-a', serve, 0);
      const second = await resolveServeWithCooldown('slug-a', serve, 1000);
      expect(first).toBe('url-1');
      expect(second).toBe('url-1');
      expect(calls).toBe(1);
    });

    it('TTL 経過後は serve を再度呼ぶ', async () => {
      let calls = 0;
      const serve = (): Promise<string> => {
        calls += 1;
        return Promise.resolve(`url-${calls.toString()}`);
      };
      await resolveServeWithCooldown('slug-b', serve, 0);
      const after = await resolveServeWithCooldown('slug-b', serve, 30_001);
      expect(after).toBe('url-2');
      expect(calls).toBe(2);
    });
  });

  describe('エッジケース', () => {
    it('同時（in-flight 中）の呼び出しは single-flight で serve を1回に束ねる', async () => {
      let calls = 0;
      let release!: (url: string) => void;
      const serve = (): Promise<string> => {
        calls += 1;
        return new Promise<string>((resolve) => {
          release = resolve;
        });
      };
      const p1 = resolveServeWithCooldown('slug-c', serve, 0);
      const p2 = resolveServeWithCooldown('slug-c', serve, 0);
      release('shared');
      const [r1, r2] = await Promise.all([p1, p2]);
      expect(r1).toBe('shared');
      expect(r2).toBe('shared');
      expect(calls).toBe(1);
    });

    it('serve が null を返したらキャッシュせず、次回は再度呼ぶ', async () => {
      let calls = 0;
      let nextUrl: string | null = null;
      const serve = (): Promise<string | null> => {
        calls += 1;
        return Promise.resolve(nextUrl);
      };
      const first = await resolveServeWithCooldown('slug-d', serve, 0);
      nextUrl = 'ok';
      const second = await resolveServeWithCooldown('slug-d', serve, 1);
      expect(first).toBeNull();
      expect(second).toBe('ok');
      expect(calls).toBe(2);
    });
  });
});
