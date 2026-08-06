'use client';

import { useSyncExternalStore } from 'react';

// ハイドレーション済みかは一度 true になったら変わらないため、購読は不要。
const subscribeNoop = (): (() => void) => () => undefined;

const getSnapshot = (): boolean => true;
const getServerSnapshot = (): boolean => false;

export const useIsHydrated = (): boolean =>
  useSyncExternalStore(subscribeNoop, getSnapshot, getServerSnapshot);
