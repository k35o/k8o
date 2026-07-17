'use client';

import { useSyncExternalStore } from 'react';

import { END_OF_CONTENT_ID } from '../constants';
import { resolveActiveHeading } from './resolve-active-heading';

// MDXの見出しはmdx-componentsで1段深いタグに変換される（## → h3, ### → h4, #### → h5）
const HEADING_SELECTOR = `h3[id], h4[id], h5[id], #${END_OF_CONTENT_ID}`;

// IntersectionObserverは判定バンド（画面上部の細い帯）を見出しが1フレームで
// 飛び越えると発火しないため、速いスクロールで現在地を取りこぼす。
// そのためスクロールとレイアウト変化のたびに全見出しの位置から現在地を計算する。
// 計測はピルとサイドレールで共有するため、モジュールスコープのストアに一本化している。
let activeId = '';
const listeners = new Set<() => void>();
let teardown: (() => void) | null = null;
let frame = 0;

const setActiveId = (id: string): void => {
  if (activeId === id) return;
  activeId = id;
  for (const listener of listeners) listener();
};

const update = (): void => {
  frame = 0;
  const targets = [...document.querySelectorAll(HEADING_SELECTOR)];
  const eocElement =
    targets.find((target) => target.id === END_OF_CONTENT_ID) ?? null;
  const measurements = targets.map((target) => {
    const rect = target.getBoundingClientRect();
    return {
      id: target.id,
      top: rect.top,
      isRendered: rect.width !== 0 || rect.height !== 0,
      isInsideEndOfContent:
        eocElement !== null &&
        target !== eocElement &&
        eocElement.contains(target),
    };
  });
  const isAtBottom =
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight - 1;
  setActiveId(resolveActiveHeading(measurements, isAtBottom));
};

const requestUpdate = (): void => {
  if (frame !== 0) return;
  frame = requestAnimationFrame(update);
};

const start = (): void => {
  const observer = new ResizeObserver(requestUpdate);
  observer.observe(document.body);
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  teardown = () => {
    if (frame !== 0) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    observer.disconnect();
    window.removeEventListener('scroll', requestUpdate);
    window.removeEventListener('resize', requestUpdate);
  };
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  if (listeners.size === 1) start();
  requestUpdate();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      teardown?.();
      teardown = null;
    }
  };
};

const getSnapshot = (): string => activeId;
const getServerSnapshot = (): string => '';

export const useActiveHeading = (): [string, (id: string) => void] => {
  const id = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [id, setActiveId];
};
