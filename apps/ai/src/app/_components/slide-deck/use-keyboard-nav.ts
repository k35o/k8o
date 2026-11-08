'use client';

import { useEffect, useEffectEvent } from 'react';
import type { RefObject } from 'react';

const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown', 'PageDown', ' ']);
const PREV_KEYS = new Set(['ArrowLeft', 'ArrowUp', 'PageUp']);

// 同じ画面に会話や多数の操作要素が並ぶため、デッキの中（scopeRef）にフォーカスがあるときだけ
// 扱い、その中のフォーカス可能な要素（ボタン・スクロール可能なノート欄など）では、Space による
// ボタン起動や矢印キーでのスクロールといった既定動作に譲る。
// デッキの要素の onKeyDown で受けないのは、静的な要素にキーのハンドラを付けると a11y の lint に
// 当たるため。ref オブジェクトで確かめるのは、スライドが1枚も無いあいだはデッキの要素が無く、
// 届いてから現れるため
export const useKeyboardNav = ({
  scopeRef,
  onNext,
  onPrev,
  onFirst,
  onLast,
}: {
  scopeRef: RefObject<HTMLElement | null>;
  onNext: () => void;
  onPrev: () => void;
  onFirst: () => void;
  onLast: () => void;
}) => {
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    const { target } = event;
    if (
      !(target instanceof Node) ||
      scopeRef.current?.contains(target) !== true
    ) {
      return;
    }
    if (target instanceof HTMLElement) {
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      if (target.tabIndex >= 0) {
        return;
      }
    }
    if (NEXT_KEYS.has(event.key)) {
      event.preventDefault();
      onNext();
      return;
    }
    if (PREV_KEYS.has(event.key)) {
      event.preventDefault();
      onPrev();
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      onFirst();
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      onLast();
    }
  });

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      handleKeyDown(event);
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, []);
};
