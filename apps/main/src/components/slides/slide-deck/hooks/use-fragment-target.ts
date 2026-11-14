'use client';

import { useCallback } from 'react';
import type { RefCallback } from 'react';

import { isSlideHash } from '../slide-deck/deck-state';

// デッキは画面を覆うので、番号でない fragment の先（スキップリンクの main など）はどれもデッキの下に隠れる。
// その hash に移すと番号が消えて 1 枚目に戻るので、移動を止め、渡された要素（デッキ）にフォーカスを移す。
// 戻る・進むは止めると履歴を動かせなくなるので通す
export const useFragmentTarget = (): RefCallback<HTMLElement> =>
  useCallback((target: HTMLElement | null) => {
    if (target === null) return undefined;
    const handler = (event: NavigateEvent): void => {
      if (!event.hashChange || event.navigationType === 'traverse') return;
      if (isSlideHash(new URL(event.destination.url).hash.slice(1))) return;
      event.preventDefault();
      target.focus();
    };
    navigation.addEventListener('navigate', handler);
    return () => {
      navigation.removeEventListener('navigate', handler);
    };
  }, []);
