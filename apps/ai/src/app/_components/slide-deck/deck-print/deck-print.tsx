'use client';

import { Suspense, use } from 'react';
import type { FC } from 'react';
import { browser, createPortal } from 'react-dom';

import type { DeckSlide } from '@/features/slides/application/parse-deck';

import { DeckSlideView } from '../deck-slide-view';
import { Stage } from '../stage';

import styles from './deck-print.module.css';

type DeckPrintProps = { slides: DeckSlide[] };

const DeckPrintPortal: FC<DeckPrintProps> = ({ slides }) => {
  // body へのポータルはブラウザでしか作れない。サーバーは fallback（何も無し）を描き、
  // hydrate 後にここが描かれる
  use(browser());

  return createPortal(
    <div className={styles['root']} data-slide-print="true">
      {slides.map((slide, index) => (
        // スライドは並び替わらないため index を key に使う
        <div className={styles['page']} key={index}>
          <Stage flush>
            <DeckSlideView slide={slide} />
          </Stage>
        </div>
      ))}
    </div>,
    document.body,
  );
};

// 印刷/PDF出力用に全スライドを1枚ずつ body 直下へ描画する。
// 画面では非表示で、@media print のときだけ表示される（deck-print.module.css）。
// 外側の Suspense（DeckHighlightsBoundary）の fallback にも children として入るので、
// 境界は自分で持つ
export const DeckPrint: FC<DeckPrintProps> = ({ slides }) => (
  <Suspense>
    <DeckPrintPortal slides={slides} />
  </Suspense>
);
