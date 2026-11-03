'use client';

import { useAppState } from '@k8ordo/state';
import { cn } from '@repo/helpers/cn';
import type { FC } from 'react';

import type { Slide } from '@/components/slides/split-slides/split-slides';

import { useDeckController } from '../hooks/use-deck-controller';
import { useClosePresenterOnViewerStop } from '../hooks/use-presenter-lifecycle';
import { NavButton } from '../nav-button/nav-button';
import { slideDeckState } from '../slide-deck/deck-state';
import { Stage } from '../stage/stage';

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
  const [{ session: sessionId }] = useAppState(slideDeckState, ['session']);
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
              {current?.content}
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
                {nextSlide.content}
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
