'use client';

import type { FC } from 'react';
import { createPortal } from 'react-dom';

import type { Slide } from '@/components/slides/split-slides/split-slides';

import { Stage } from '../stage/stage';

import styles from './deck-print.module.css';

// 印刷/PDF出力用に全スライドを1枚ずつ body 直下へ描画する。
// 画面では非表示で、@media print のときだけ表示される（deck-print.module.css）。
export const DeckPrint: FC<{ slides: Slide[] }> = ({ slides }) =>
  createPortal(
    <>
      {/* スライドを 16:9 のページとして出力する。CSS Modules の CSS はデッキを離れてもタブに残り、ほかの
          ページの印刷も変えるので、デッキと一緒に外れる <style> に書く。href と precedence を付けると head に
          上がって残る。名前付きページは WebKit が照合しない */}
      <style>{'@media print{@page{size:1280px 720px;margin:0}}'}</style>
      <div className={styles.root} data-slide-print="true">
        {slides.map((slide, index) => (
          // スライドは並び替わらないため index を key に使う
          <div className={styles.page} key={index}>
            <Stage flush>{slide.content}</Stage>
          </div>
        ))}
      </div>
    </>,
    document.body,
  );
