import { useSyncExternalStore } from 'react';

export const useClient = (): boolean => {
  return useSyncExternalStore(
    () => () => {
      // なにもしない
    },
    () => true,
    () => false,
  );
};
