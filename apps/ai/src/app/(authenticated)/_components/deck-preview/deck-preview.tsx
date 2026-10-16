'use client';

import { useMemo, useRef, useState } from 'react';
import type { FC } from 'react';

import {
  DeckHighlightsBoundary,
  DeckPrint,
  DeckSlideView,
  NavButton,
  ProgressBar,
  Stage,
  useKeyboardNav,
} from '@/app/_components/slide-deck';
import { parseDeck } from '@/features/slides/application/parse-deck';

import styles from './deck-preview.module.css';

type DeckPreviewProps = {
  source: string | null;
  isStreaming: boolean;
  // 印刷の CSS は、body に印刷用のスライドがあるあいだ、ほかの要素を印刷から外す。会話のペインで
  // 描くと、会話の画面の印刷はスライドになる。また、会話の画面は別のパスへ移っても Activity で
  // 隠れたまま残り、印刷用のスライドも display: none で body に残るので、ほかの画面の印刷は白紙になる
  printable: boolean;
};

export const DeckPreview: FC<DeckPreviewProps> = ({
  source,
  isStreaming,
  printable,
}) => {
  const slides = useMemo(() => parseDeck(source ?? ''), [source]);
  const rootRef = useRef<HTMLDivElement>(null);
  const total = slides.length;
  const [index, setIndex] = useState(0);

  // 生成完了の瞬間に表紙へ戻す（生成中は末尾のスライドへ自動追従しているため）。
  const [prevStreaming, setPrevStreaming] = useState(isStreaming);
  if (prevStreaming !== isStreaming) {
    setPrevStreaming(isStreaming);
    if (!isStreaming) {
      setIndex(0);
    }
  }

  const safeIndex = total === 0 ? 0 : Math.min(index, total - 1);
  // 生成中は書き込まれている最中のスライド（末尾）を見せて進捗が分かるようにする。
  const displayIndex = isStreaming && total > 0 ? total - 1 : safeIndex;

  const goTo = (target: number): void => {
    if (total === 0 || isStreaming) {
      return;
    }
    setIndex(Math.min(Math.max(target, 0), total - 1));
  };

  useKeyboardNav({
    scopeRef: rootRef,
    onNext: () => {
      goTo(displayIndex + 1);
    },
    onPrev: () => {
      goTo(displayIndex - 1);
    },
    onFirst: () => {
      goTo(0);
    },
    onLast: () => {
      goTo(total - 1);
    },
  });

  if (total === 0) {
    return (
      <div className={styles.empty}>
        {isStreaming
          ? 'スライドを生成しています…'
          : '生成すると、ここにスライドのプレビューが表示されます'}
      </div>
    );
  }

  const current = slides[displayIndex] ?? slides[0];
  // ノート欄はスライドごとに出し分けるとステージの高さが変わってレイアウトシフトが
  // 起きるため、デッキ内のどこかにノートがあれば固定高で常に表示する。
  const deckHasNotes = slides.some((slide) => slide.notes.length > 0);
  const currentNotes = current?.notes ?? [];

  return (
    // 取得したハイライトを配下の全スライド（DeckPrint 含む）へ配る。
    <DeckHighlightsBoundary isStreaming={isStreaming} slides={slides}>
      {/* スライドを押すとデッキにフォーカスが入り、キーで送れる。Tab では止めない */}
      <div className={styles.root} ref={rootRef} tabIndex={-1}>
        <ProgressBar current={displayIndex} total={total} />
        <div className={styles.stage}>
          <Stage key={displayIndex}>
            {current === undefined ? null : <DeckSlideView slide={current} />}
          </Stage>
        </div>
        {deckHasNotes ? (
          <div className={styles.notes}>
            {/* max-h を超えたときキーボードでスクロールできるよう tabIndex でフォーカス可能にする
              （スクロール領域の既知の例外なので a11y ルールを範囲抑制する）。 */}
            {/* oxlint-disable jsx-a11y/no-noninteractive-tabindex */}
            <section
              aria-label="発表者ノート"
              className={styles.notesPanel}
              tabIndex={0}
            >
              {currentNotes.length > 0 ? (
                <>
                  <span className={styles.notesLabel}>ノート: </span>
                  {currentNotes.join('\n')}
                </>
              ) : (
                'このスライドにノートはありません'
              )}
            </section>
            {/* oxlint-enable jsx-a11y/no-noninteractive-tabindex */}
          </div>
        ) : null}
        <div className={styles.nav}>
          <NavButton
            direction="prev"
            disabled={isStreaming || displayIndex === 0}
            onAction={() => {
              goTo(displayIndex - 1);
            }}
          />
          <p aria-live="polite" className={styles.counter}>
            <span className={styles.current}>{displayIndex + 1}</span> / {total}
          </p>
          <NavButton
            direction="next"
            disabled={isStreaming || displayIndex === total - 1}
            onAction={() => {
              goTo(displayIndex + 1);
            }}
          />
        </div>
        {/* 印刷/PDF出力用の全スライド描画（画面では非表示） */}
        {printable ? <DeckPrint slides={slides} /> : null}
      </div>
    </DeckHighlightsBoundary>
  );
};
