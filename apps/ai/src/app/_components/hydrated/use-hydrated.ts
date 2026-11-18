'use client';

import { useSyncExternalStore } from 'react';

const subscribeNever = (): (() => void) => () => undefined;
const hydrated = (): boolean => true;
const notHydrated = (): boolean => false;

/** サーバーと hydrate の描画では false、hydrate が済んだあとは true を返す */
export const useHydrated = (): boolean =>
  useSyncExternalStore(subscribeNever, hydrated, notHydrated);
