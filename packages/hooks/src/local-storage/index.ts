import { useCallback, useMemo, useSyncExternalStore } from 'react';

const dispatchStorageEvent = (key: string, newValue: string | null) =>
  window.dispatchEvent(new StorageEvent('storage', { key, newValue }));

const getLocalStorageItem = (key: string) => window.localStorage.getItem(key);

const localStorageSubscribe = (cb: () => void) => {
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener('storage', cb);
  };
};

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const getSnapshot = () => getLocalStorageItem(key);
  const store = useSyncExternalStore(
    localStorageSubscribe,
    getSnapshot,
    () => null,
  );

  const current = useMemo(() => {
    try {
      if (store === null) {
        return initialValue;
      }
      return JSON.parse(store) as T;
    } catch (e) {
      console.error(e);
      return initialValue;
    }
  }, [store, initialValue]);

  const handleRemove = useCallback(() => {
    window.localStorage.removeItem(key);
    dispatchStorageEvent(key, null);
  }, [key]);

  const setState = useCallback(
    (value: T) => {
      if (value === undefined || value === null) {
        handleRemove();
      } else {
        const stringifiedValue = JSON.stringify(value);
        window.localStorage.setItem(key, stringifiedValue);
        dispatchStorageEvent(key, stringifiedValue);
      }
    },
    [key, handleRemove],
  );

  return [current, setState, handleRemove] as const;
};
