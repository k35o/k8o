import { resolveServeWithCooldown } from './serve-cooldown';

// 注: モジュール内 Map は状態を持つため、テストごとに一意の slug を使う。

// 決定的な時刻源。advance/set で進められる。
const makeClock = (start = 0) => {
  let t = start;
  return {
    clock: (): number => t,
    advance: (ms: number): void => {
      t += ms;
    },
    set: (v: number): void => {
      t = v;
    },
  };
};

describe('resolveServeWithCooldown', () => {
  describe('正常系', () => {
    it('TTL 内の連続呼び出しは serve を1回だけ呼び、キャッシュ URL を返す', async () => {
      let calls = 0;
      const serve = (): Promise<string> => {
        calls += 1;
        return Promise.resolve(`url-${calls.toString()}`);
      };
      const { clock, advance } = makeClock(0);
      const first = await resolveServeWithCooldown('slug-a', serve, clock);
      advance(1000);
      const second = await resolveServeWithCooldown('slug-a', serve, clock);
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
      const { clock, advance } = makeClock(0);
      await resolveServeWithCooldown('slug-b', serve, clock);
      advance(30_001);
      const after = await resolveServeWithCooldown('slug-b', serve, clock);
      expect(after).toBe('url-2');
      expect(calls).toBe(2);
    });
  });

  describe('エッジケース', () => {
    it('cold start で serve が遅延 resolve しても TTL は完了時刻から効く', async () => {
      // 呼び出し時刻基準の旧実装ならここで再 serve され calls=2 になり落ちる。
      let calls = 0;
      let release!: (url: string) => void;
      const serve = (): Promise<string> => {
        calls += 1;
        return new Promise<string>((resolve) => {
          release = resolve;
        });
      };
      const { clock, set } = makeClock(0);
      const p1 = resolveServeWithCooldown('slug-cold', serve, clock);
      // serve 中に 35 秒経過（cold start 模擬）してから完了。
      set(35_000);
      release('warm');
      expect(await p1).toBe('warm');
      // 完了時刻(35_000)から TTL。完了 +5 秒ならまだキャッシュヒット。
      set(40_000);
      const p2 = await resolveServeWithCooldown('slug-cold', serve, clock);
      expect(p2).toBe('warm');
      expect(calls).toBe(1);
    });

    it('同時（in-flight 中）の呼び出しは single-flight で serve を1回に束ねる', async () => {
      let calls = 0;
      let release!: (url: string) => void;
      const serve = (): Promise<string> => {
        calls += 1;
        return new Promise<string>((resolve) => {
          release = resolve;
        });
      };
      const { clock } = makeClock(0);
      const p1 = resolveServeWithCooldown('slug-c', serve, clock);
      const p2 = resolveServeWithCooldown('slug-c', serve, clock);
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
      const { clock } = makeClock(0);
      const first = await resolveServeWithCooldown('slug-d', serve, clock);
      nextUrl = 'ok';
      const second = await resolveServeWithCooldown('slug-d', serve, clock);
      expect(first).toBeNull();
      expect(second).toBe('ok');
      expect(calls).toBe(2);
    });

    it('serve が reject したら null を返し、キャッシュしない（spinner 固着を防ぐ）', async () => {
      let calls = 0;
      const serve = (): Promise<string> => {
        calls += 1;
        return Promise.reject(new Error('boom'));
      };
      const { clock } = makeClock(0);
      const first = await resolveServeWithCooldown('slug-err', serve, clock);
      const second = await resolveServeWithCooldown('slug-err', serve, clock);
      expect(first).toBeNull();
      expect(second).toBeNull();
      expect(calls).toBe(2);
    });
  });
});
