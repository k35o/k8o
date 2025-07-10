import { useSyncExternalStore } from 'react';

const getHash = () =>
  typeof window !== 'undefined'
    ? decodeURIComponent(window.location.hash.replace('#', ''))
    : null;

const subscribe = (callback: () => void) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { pushState, replaceState } = window.history;

  window.history.pushState = (...args) => {
    pushState.apply(window.history, args);
    setTimeout(callback);
  };
  window.history.replaceState = (...args) => {
    replaceState.apply(window.history, args);
    setTimeout(callback);
  };

  // hash changeに応じてhashを更新
  window.addEventListener('hashchange', callback);
  return () => {
    window.removeEventListener('hashchange', callback);
  };
};

export const useHash = (): string | null => {
  const hash = useSyncExternalStore<string | null>(
    subscribe,
    () => getHash(),
    () => null,
  );

  return hash;
};
