import { describe, expect, it, vi } from 'vitest';

import { createLiveSnapshotStore } from './live-snapshot';

describe('createLiveSnapshotStore', () => {
  describe('正常系', () => {
    it('購読を始めると読み込み、読めたら購読者に知らせて値を返す', async () => {
      const store = createLiveSnapshotStore();
      const onChange = vi.fn();

      store.subscriber(
        'browser-support',
        () => Promise.resolve({ version: '3.53.0' }),
        { version: '3.52.0' },
      )(onChange);
      expect(store.getSnapshot('browser-support')).toBeUndefined();

      await vi.waitFor(() => {
        expect(onChange).toHaveBeenCalledOnce();
      });
      expect(store.getSnapshot('browser-support')).toStrictEqual({
        version: '3.53.0',
      });
    });

    it('同じ key を複数が購読しても、読み込みは1回で、全員に知らせる', async () => {
      const store = createLiveSnapshotStore();
      const load = vi.fn(() => Promise.resolve('最新'));
      const first = vi.fn();
      const second = vi.fn();

      store.subscriber('key', load, 'ビルド時')(first);
      store.subscriber('key', load, 'ビルド時')(second);

      await vi.waitFor(() => {
        expect(second).toHaveBeenCalledOnce();
      });
      expect(first).toHaveBeenCalledOnce();
      expect(load).toHaveBeenCalledOnce();
    });

    it('一度読んだ key は、購読し直しても読み直さない', async () => {
      const store = createLiveSnapshotStore();
      const load = vi.fn(() => Promise.resolve('最新'));
      const unsubscribe = store.subscriber('key', load, 'ビルド時')(vi.fn());
      await vi.waitFor(() => {
        expect(store.getSnapshot('key')).toBe('最新');
      });
      unsubscribe();

      store.subscriber('key', load, 'ビルド時')(vi.fn());

      expect(load).toHaveBeenCalledOnce();
      expect(store.getSnapshot('key')).toBe('最新');
    });

    it('key ごとに同じ購読の関数を返す', () => {
      const store = createLiveSnapshotStore();
      const load = (): Promise<string> => Promise.resolve('最新');

      expect(store.subscriber('key', load, 'ビルド時')).toBe(
        store.subscriber('key', load, 'ビルド時'),
      );
      expect(store.subscriber('key', load, 'ビルド時')).not.toBe(
        store.subscriber('other', load, 'ビルド時'),
      );
    });

    it('購読をやめたら、あとで読めても知らせない', async () => {
      const store = createLiveSnapshotStore();
      const { promise, resolve } = Promise.withResolvers<string | null>();
      const onChange = vi.fn();
      const unsubscribe = store.subscriber(
        'key',
        () => promise,
        'ビルド時',
      )(onChange);

      unsubscribe();
      resolve('最新');
      await vi.waitFor(() => {
        expect(store.getSnapshot('key')).toBe('最新');
      });

      expect(onChange).not.toHaveBeenCalled();
    });

    it('読めた値がビルドの値と同じなら、値を持たず、知らせず、読み直さない', async () => {
      const store = createLiveSnapshotStore();
      const load = vi.fn(() =>
        Promise.resolve({ articles: [{ id: 1, summary: null }], sources: [] }),
      );
      const onChange = vi.fn();

      store.subscriber('key', load, {
        articles: [{ id: 1, summary: null }],
        sources: [],
      })(onChange);
      await vi.waitFor(() => {
        expect(load).toHaveBeenCalledOnce();
      });
      await Promise.resolve();
      store.subscriber('key', load, null)(vi.fn());

      expect(store.getSnapshot('key')).toBeUndefined();
      expect(onChange).not.toHaveBeenCalled();
      expect(load).toHaveBeenCalledOnce();
    });

    it('入れ子の1か所でもビルドの値と違えば、読めた値を返して知らせる', async () => {
      const store = createLiveSnapshotStore();
      const latest = { articles: [{ id: 1, summary: '要約' }], sources: [] };
      const onChange = vi.fn();

      store.subscriber('key', () => Promise.resolve(latest), {
        articles: [{ id: 1, summary: null }],
        sources: [],
      })(onChange);

      await vi.waitFor(() => {
        expect(onChange).toHaveBeenCalledOnce();
      });
      expect(store.getSnapshot('key')).toBe(latest);
    });
  });

  describe('異常系', () => {
    it('読めなかったら値を持たず、知らせず、読み直さない', async () => {
      const store = createLiveSnapshotStore();
      const load = vi.fn(() => Promise.resolve(null));
      const onChange = vi.fn();

      store.subscriber('key', load, 'ビルド時')(onChange);
      await vi.waitFor(() => {
        expect(load).toHaveBeenCalledOnce();
      });
      await Promise.resolve();
      store.subscriber('key', load, 'ビルド時')(vi.fn());

      expect(store.getSnapshot('key')).toBeUndefined();
      expect(onChange).not.toHaveBeenCalled();
      expect(load).toHaveBeenCalledOnce();
    });
  });

  describe('エッジケース', () => {
    it('reset で値を捨て、次の購読で読み直す', async () => {
      const store = createLiveSnapshotStore();
      const load = vi
        .fn<() => Promise<string>>()
        .mockResolvedValueOnce('1回目')
        .mockResolvedValueOnce('2回目');
      store.subscriber('key', load, 'ビルド時')(vi.fn());
      await vi.waitFor(() => {
        expect(store.getSnapshot('key')).toBe('1回目');
      });

      store.reset();
      expect(store.getSnapshot('key')).toBeUndefined();
      store.subscriber('key', load, 'ビルド時')(vi.fn());

      await vi.waitFor(() => {
        expect(store.getSnapshot('key')).toBe('2回目');
      });
      expect(load).toHaveBeenCalledTimes(2);
    });

    it('reset の前に始めた読み込みの結果は、reset のあとに残さない', async () => {
      const store = createLiveSnapshotStore();
      const { promise, resolve } = Promise.withResolvers<string | null>();
      store.subscriber('key', () => promise, 'ビルド時')(vi.fn());

      store.reset();
      resolve('前の story の値');
      await promise;
      await Promise.resolve();

      expect(store.getSnapshot('key')).toBeUndefined();
    });

    it('reset のあとの購読は、そのときに渡したビルドの値と比べる', async () => {
      const store = createLiveSnapshotStore();
      const load = vi.fn(() => Promise.resolve('最新'));
      store.subscriber('key', load, '最新')(vi.fn());
      await vi.waitFor(() => {
        expect(load).toHaveBeenCalledOnce();
      });

      store.reset();
      store.subscriber('key', load, '前のビルド')(vi.fn());

      await vi.waitFor(() => {
        expect(store.getSnapshot('key')).toBe('最新');
      });
    });

    it('キーの並びが違っても、同じ値ならビルドの値と同じとみなす', async () => {
      const store = createLiveSnapshotStore();
      const load = vi.fn(() =>
        Promise.resolve({ source: { title: 'Zenn', id: 2 }, id: 1 }),
      );

      store.subscriber('key', load, {
        id: 1,
        source: { id: 2, title: 'Zenn' },
      })(vi.fn());
      await vi.waitFor(() => {
        expect(load).toHaveBeenCalledOnce();
      });
      await Promise.resolve();

      expect(store.getSnapshot('key')).toBeUndefined();
    });

    it.each([
      ['キーの数', { id: 1, summary: null }, { id: 1 }],
      ['配列の長さ', [1, 2], [1, 2, 3]],
      ['配列とオブジェクト', { 0: 'a' }, ['a']],
      ['null とオブジェクト', null, {}],
    ])(
      '%s が違えば、ビルドの値と違うとみなす',
      async (_label, initial, latest) => {
        const store = createLiveSnapshotStore();

        store.subscriber(
          'key',
          () => Promise.resolve(latest),
          initial,
        )(vi.fn());

        await vi.waitFor(() => {
          expect(store.getSnapshot('key')).toBe(latest);
        });
      },
    );
  });
});
