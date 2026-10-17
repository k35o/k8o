'use client';

import { Suspense, use } from 'react';
import type { FC } from 'react';
import { browser, createPortal } from 'react-dom';

import type { DeckSlide } from '@/features/slides/application/parse-deck';

import { DeckSlideView } from '../deck-slide-view';
import { Stage } from '../stage';

import styles from './deck-print.module.css';

// @page と body 直下の規則は文書全体に効くので、CSS Modules に置かず、印刷用のスライドを
// 表示しているあいだだけ有効にする。hidden の Activity の中で描かれると ref が付かないので、
// 切った状態（not all）で描き、ref が付いてから有効にする
const PRINT_RULES = `
@page { size: 1280px 720px; margin: 0; }
body > *:not([data-slide-print]) { display: none !important; }
`;

const enablePrintRules = (style: HTMLStyleElement): (() => void) => {
  style.media = 'print';
  return () => {
    style.media = 'not all';
  };
};

type DeckPrintProps = { slides: DeckSlide[] };

const DeckPrintPortal: FC<DeckPrintProps> = ({ slides }) => {
  // body へのポータルはブラウザでしか作れない。サーバーは fallback（何も無し）を描き、
  // hydrate 後にここが描かれる
  use(browser());

  return createPortal(
    <>
      <style media="not all" ref={enablePrintRules}>
        {PRINT_RULES}
      </style>
      <div className={styles.root} data-slide-print="true">
        {slides.map((slide, index) => (
          // スライドは並び替わらないため index を key に使う
          <div className={styles.page} key={index}>
            <Stage flush>
              <DeckSlideView slide={slide} />
            </Stage>
          </div>
        ))}
      </div>
    </>,
    document.body,
  );
};

// 印刷/PDF出力用に全スライドを1枚ずつ body 直下へ描画する。
// 画面では非表示で、@media print のときだけ表示される（deck-print.module.css）。
// ポータルはサーバーでは描けず suspend するので、デッキの本体まで fallback に
// 巻き込まないよう境界は自分で持つ
export const DeckPrint: FC<DeckPrintProps> = ({ slides }) => (
  <Suspense>
    <DeckPrintPortal slides={slides} />
  </Suspense>
);
