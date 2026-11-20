'use client';

import { useSyncExternalStore } from 'react';

export const DOCK_SLOT_ID = 'dock-slot';

const subscribe = (): (() => void) => () => {};
const getSnapshot = (): HTMLElement | null =>
  document.querySelector<HTMLElement>(`#${DOCK_SLOT_ID}`);
const getServerSnapshot = (): null => null;

/** ページが自分の項目をドックに足すための置き場。ドックが無いあいだと HTML では null */
export const useDockSlot = (): HTMLElement | null =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
