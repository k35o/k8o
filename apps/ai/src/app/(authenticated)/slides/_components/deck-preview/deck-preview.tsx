'use client';

import { useContext, useMemo, useState, type FC } from 'react';

import {
  DeckHighlightContext,
  DeckHighlightsContext,
  DeckPrint,
  DeckSlideView,
  NavButton,
  ProgressBar,
  Stage,
  useDeckHighlights,
  useKeyboardNav,
} from '@/app/_components/slide-deck';
import { parseDeck } from '@/features/slides/application/parse-deck';

type DeckPreviewProps = {
  source: string | null;
  isStreaming: boolean;
};

export const DeckPreview: FC<DeckPreviewProps> = ({ source, isStreaming }) => {
  const slides = useMemo(() => parseDeck(source ?? ''), [source]);
  const total = slides.length;
  const [index, setIndex] = useState(0);
  // コードブロックのハイライトをデッキ単位で一括取得する（関数はスタジオから注入）。
  const highlightFn = useContext(DeckHighlightContext);
  const highlights = useDeckHighlights(slides, isStreaming, highlightFn);

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
      <div className="text-fg-mute flex h-full items-center justify-center p-6 text-center text-sm leading-relaxed">
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
    // 取得済みハイライトを配下の全スライド（DeckPrint 含む）へ配る。
    <DeckHighlightsContext.Provider value={highlights}>
      <div className="flex h-full min-h-0 flex-col">
        <ProgressBar current={displayIndex} total={total} />
        <div className="min-h-0 flex-1 px-4 pt-2">
          <Stage key={displayIndex}>
            {current === undefined ? null : <DeckSlideView slide={current} />}
          </Stage>
        </div>
        {deckHasNotes ? (
          <div className="px-4 pt-2">
            {/* max-h を超えたときキーボードでスクロールできるよう tabIndex でフォーカス可能にする
              （スクロール領域の既知の例外なので a11y ルールを範囲抑制する）。 */}
            {/* oxlint-disable jsx-a11y/no-noninteractive-tabindex */}
            <section
              aria-label="発表者ノート"
              className="border-border-mute text-fg-mute h-24 overflow-auto rounded-lg border px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap"
              tabIndex={0}
            >
              {currentNotes.length > 0 ? (
                <>
                  <span className="text-fg-base font-bold">ノート: </span>
                  {currentNotes.join('\n')}
                </>
              ) : (
                'このスライドにノートはありません'
              )}
            </section>
            {/* oxlint-enable jsx-a11y/no-noninteractive-tabindex */}
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-2 px-4 py-2">
          <NavButton
            direction="prev"
            disabled={isStreaming || displayIndex === 0}
            onAction={() => {
              goTo(displayIndex - 1);
            }}
          />
          <p
            aria-live="polite"
            className="text-fg-mute text-sm font-medium tabular-nums"
          >
            <span className="text-primary-fg">{displayIndex + 1}</span> /{' '}
            {total}
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
        <DeckPrint slides={slides} />
      </div>
    </DeckHighlightsContext.Provider>
  );
};
