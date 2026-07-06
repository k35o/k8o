'use client';

import type { FC } from 'react';
import { createPortal } from 'react-dom';

import type { Slide } from '@/features/slides/application/split-slides';

import { useIsHydrated } from '../hooks/use-is-hydrated';
import { Stage } from '../stage';

import styles from './deck-print.module.css';

// 印刷/PDF出力用に全スライドを1枚ずつ body 直下へ描画する。
// 画面では非表示で、@media print のときだけ表示される（deck-print.module.css）。
export const DeckPrint: FC<{ slides: Slide[] }> = ({ slides }) => {
  const isHydrated = useIsHydrated();

  if (!isHydrated) return null;

  return createPortal(
    <div className={styles['root']} data-slide-print="true">
      {slides.map((slide, index) => (
        // スライドは並び替わらないため index を key に使う
        <div className={styles['page']} key={index}>
          <Stage flush>{slide.content}</Stage>
        </div>
      ))}
    </div>,
    document.body,
  );
};
