'use client';

import { cn } from '@repo/helpers/cn';
import { useState } from 'react';
import type { FC } from 'react';

import type { Slide } from '@/app/slides/_utils/split-slides';

import { BrowserOnly } from '../browser-only';
import { useDeckController } from '../hooks/use-deck-controller';
import { useClosePresenterOnViewerStop } from '../hooks/use-presenter-lifecycle';
import { NavButton } from '../nav-button';
import { Stage } from '../stage';

import styles from './deck-presenter.module.css';

export const DeckPresenter: FC<{
  slug: string;
  title: string;
  slides: Slide[];
  qrUrl: string;
}> = ({ slug, title, slides, qrUrl }) => {
  const total = slides.length;
  const { index, next, prev } = useDeckController({
    total,
    channelName: `slides:${slug}`,
  });
  const current = slides[index] ?? slides[0];
  const nextSlide = slides[index + 1];
  // oxlint-disable-next-line react/hook-use-state -- 初期化時に一度だけ算出する安定値で setter は不要
  const [sessionId] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('session') ?? '';
  });
  useClosePresenterOnViewerStop({ slug, sessionId });

  return (
    <section aria-label={`${title} - 発表者モード`} className={styles.root}>
      <header className={styles.header}>
        <p className={styles.title}>
          {title} <span className={styles.mode}>- 発表者モード</span>
        </p>
        <p aria-live="polite" className={styles.counter}>
          {index + 1} <span className={styles.total}>/ {total}</span>
        </p>
      </header>
      <div className={styles.panels}>
        <section aria-label="現在のスライド" className={styles.current}>
          <p className={cn(styles.caption, styles.captionCurrent)}>Now</p>
          <div className={styles.slot}>
            <Stage key={`current-${index.toString()}`} qrUrl={qrUrl}>
              <BrowserOnly>{current?.content}</BrowserOnly>
            </Stage>
          </div>
        </section>
        <section aria-label="次のスライド" className={styles.next}>
          <p className={cn(styles.caption, styles.captionNext)}>Next</p>
          <div className={styles.slot}>
            {nextSlide === undefined ? (
              <div className={styles.end}>最終スライドです</div>
            ) : (
              <Stage key={`next-${index.toString()}`}>
                <BrowserOnly>{nextSlide.content}</BrowserOnly>
              </Stage>
            )}
          </div>
        </section>
        <section aria-label="発表者ノート" className={styles.notes}>
          <p className={cn(styles.caption, styles.captionNotes)}>Notes</p>
          <div className={styles.notesBody}>
            {current === undefined || current.notes.length === 0 ? (
              <p className={styles.empty}>ノートはありません</p>
            ) : (
              current.notes.map((note, i) => (
                <div key={i.toString()}>{note}</div>
              ))
            )}
          </div>
        </section>
      </div>
      <footer className={styles.footer}>
        <NavButton direction="prev" disabled={index === 0} onAction={prev} />
        <NavButton
          direction="next"
          disabled={index === total - 1}
          onAction={next}
        />
      </footer>
    </section>
  );
};
