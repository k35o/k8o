import { useSyncExternalStore } from 'react';

type Load = () => Promise<unknown>;
type Subscribe = (onChange: () => void) => () => void;

type LiveSnapshotStore = {
  subscriber: (key: string, load: Load) => Subscribe;
  getSnapshot: (key: string) => unknown;
  reset: () => void;
};

export const createLiveSnapshotStore = (): LiveSnapshotStore => {
  // reset のたびに作り直し、reset の前に始めた読み込みの結果を古い Map に捨てさせる
  let values = new Map<string, unknown>();
  let started = new Set<string>();
  const listeners = new Map<string, Set<() => void>>();
  const subscribers = new Map<string, Subscribe>();

  const start = (key: string, load: Load): void => {
    if (started.has(key)) {
      return;
    }
    started.add(key);
    const target = values;
    void load().then((value) => {
      if (value === null) {
        return;
      }
      target.set(key, value);
      for (const listener of listeners.get(key) ?? []) {
        listener();
      }
    });
  };

  return {
    subscriber: (key, load) => {
      const existing = subscribers.get(key);
      if (existing !== undefined) {
        return existing;
      }
      const subscribe: Subscribe = (onChange) => {
        const keyListeners = listeners.get(key) ?? new Set();
        keyListeners.add(onChange);
        listeners.set(key, keyListeners);
        start(key, load);
        return () => {
          keyListeners.delete(onChange);
        };
      };
      subscribers.set(key, subscribe);
      return subscribe;
    },
    getSnapshot: (key) => values.get(key),
    reset: () => {
      values = new Map();
      started = new Set();
    },
  };
};

const store = createLiveSnapshotStore();

export const resetLiveSnapshots = store.reset;

export const useLiveSnapshot = <T>(
  key: string,
  load: () => Promise<T | null>,
  initial: T,
): T => {
  const live = useSyncExternalStore(
    store.subscriber(key, load),
    () => store.getSnapshot(key),
    // プリレンダーとハイドレーションはビルド時の値で描き、HTML とずらさない
    () => undefined,
  );
  // 同じ key には同じ形の値を読む load だけが渡る
  return live === undefined ? initial : (live as T);
};
