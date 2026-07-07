'use client';

import { useEffect, useRef } from 'react';

const NEXT_KEYS = new Set([
  'ArrowRight',
  'ArrowDown',
  'PageDown',
  ' ',
  'Spacebar',
]);
const PREV_KEYS = new Set(['ArrowLeft', 'ArrowUp', 'PageUp']);

// apps/main の slides の useKeyboardNav を移植したもの（フルスクリーンキーは省略）。
// デッキ専用ページと違いスタジオには多数の操作要素があるため、フォーカス可能な要素
// （ボタン・リンク・スクロール可能なノート欄など）にフォーカスがある間は反応せず、
// Space によるボタン起動や矢印キーでのスクロールといった既定動作に譲る。
export const useKeyboardNav = ({
  onNext,
  onPrev,
  onFirst,
  onLast,
}: {
  onNext: () => void;
  onPrev: () => void;
  onFirst: () => void;
  onLast: () => void;
}) => {
  const handlersRef = useRef({ onNext, onPrev, onFirst, onLast });
  useEffect(() => {
    handlersRef.current = { onNext, onPrev, onFirst, onLast };
  });

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const { target } = event;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
        // ボタン等の tabIndex >= 0 な要素（body 以外）にフォーカスがある間は奪わない。
        if (target !== document.body && target.tabIndex >= 0) {
          return;
        }
      }
      const h = handlersRef.current;
      if (NEXT_KEYS.has(event.key)) {
        event.preventDefault();
        h.onNext();
        return;
      }
      if (PREV_KEYS.has(event.key)) {
        event.preventDefault();
        h.onPrev();
        return;
      }
      if (event.key === 'Home') {
        event.preventDefault();
        h.onFirst();
        return;
      }
      if (event.key === 'End') {
        event.preventDefault();
        h.onLast();
      }
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, []);
};
