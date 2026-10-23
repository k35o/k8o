import { describe, expect, it, vi } from 'vitest';

import { createLiveSnapshotStore } from './live-snapshot';

describe('createLiveSnapshotStore', () => {
  describe('正常系', () => {
    it('購読を始めると読み込み、読めたら購読者に知らせて値を返す', async () => {
      const store = createLiveSnapshotStore();
      const onChange = vi.fn();

      store.subscriber('browser-support', () =>
        Promise.resolve({ version: '3.53.0' }),
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

      store.subscriber('key', load)(first);
      store.subscriber('key', load)(second);

      await vi.waitFor(() => {
        expect(second).toHaveBeenCalledOnce();
      });
      expect(first).toHaveBeenCalledOnce();
      expect(load).toHaveBeenCalledOnce();
    });

    it('一度読んだ key は、購読し直しても読み直さない', async () => {
      const store = createLiveSnapshotStore();
      const load = vi.fn(() => Promise.resolve('最新'));
      const unsubscribe = store.subscriber('key', load)(vi.fn());
      await vi.waitFor(() => {
        expect(store.getSnapshot('key')).toBe('最新');
      });
      unsubscribe();

      store.subscriber('key', load)(vi.fn());

      expect(load).toHaveBeenCalledOnce();
      expect(store.getSnapshot('key')).toBe('最新');
    });

    it('key ごとに同じ購読の関数を返す', () => {
      const store = createLiveSnapshotStore();
      const load = (): Promise<string> => Promise.resolve('最新');

      expect(store.subscriber('key', load)).toBe(store.subscriber('key', load));
      expect(store.subscriber('key', load)).not.toBe(
        store.subscriber('other', load),
      );
    });

    it('購読をやめたら、あとで読めても知らせない', async () => {
      const store = createLiveSnapshotStore();
      const { promise, resolve } = Promise.withResolvers<string | null>();
      const onChange = vi.fn();
      const unsubscribe = store.subscriber('key', () => promise)(onChange);

      unsubscribe();
      resolve('最新');
      await vi.waitFor(() => {
        expect(store.getSnapshot('key')).toBe('最新');
      });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('異常系', () => {
    it('読めなかったら値を持たず、知らせず、読み直さない', async () => {
      const store = createLiveSnapshotStore();
      const load = vi.fn(() => Promise.resolve(null));
      const onChange = vi.fn();

      store.subscriber('key', load)(onChange);
      await vi.waitFor(() => {
        expect(load).toHaveBeenCalledOnce();
      });
      await Promise.resolve();
      store.subscriber('key', load)(vi.fn());

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
      store.subscriber('key', load)(vi.fn());
      await vi.waitFor(() => {
        expect(store.getSnapshot('key')).toBe('1回目');
      });

      store.reset();
      expect(store.getSnapshot('key')).toBeUndefined();
      store.subscriber('key', load)(vi.fn());

      await vi.waitFor(() => {
        expect(store.getSnapshot('key')).toBe('2回目');
      });
      expect(load).toHaveBeenCalledTimes(2);
    });

    it('reset の前に始めた読み込みの結果は、reset のあとに残さない', async () => {
      const store = createLiveSnapshotStore();
      const { promise, resolve } = Promise.withResolvers<string | null>();
      store.subscriber('key', () => promise)(vi.fn());

      store.reset();
      resolve('前の story の値');
      await promise;
      await Promise.resolve();

      expect(store.getSnapshot('key')).toBeUndefined();
    });
  });
});
