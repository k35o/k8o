import { useEffect, useState } from 'react';
import { useClient } from '../client';

const getHash = () =>
  typeof window !== 'undefined'
    ? decodeURIComponent(window.location.hash.replace('#', ''))
    : null;

export const useHash = (): string | null => {
  const isClient = useClient();
  const [hash, setHash] = useState<string | null>(getHash);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { pushState, replaceState } = window.history;

    window.history.pushState = (...args) => {
      pushState.apply(window.history, args);
      setTimeout(() => {
        setHash(window.location.hash);
      });
    };
    window.history.replaceState = (...args) => {
      replaceState.apply(window.history, args);
      setTimeout(() => {
        setHash(window.location.hash);
      });
    };

    // hash changeに応じてhashを更新
    const hashChange = () => {
      setHash(getHash());
    };
    window.addEventListener('hashchange', hashChange);
    return () => {
      window.removeEventListener('hashchange', hashChange);
    };
  }, []);

  return isClient ? hash : null;
};
