'use client';

import { CloseIcon, IconButton } from '@k8ordo/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { FC } from 'react';

import type { Slide } from '@/app/slides/_utils/split-slides';

import { BrowserOnly } from '../browser-only';
import { useDeckController } from '../hooks/use-deck-controller';
import { useBroadcastViewerHeartbeat } from '../hooks/use-presenter-lifecycle';
import { NavButton } from '../nav-button';
import { ProgressBar } from '../progress-bar';
import { Stage } from '../stage';

import styles from './deck-viewer.module.css';

export const DeckViewer: FC<{
  slug: string;
  title: string;
  slides: Slide[];
  qrUrl: string;
}> = ({ slug, title, slides, qrUrl }) => {
  const total = slides.length;
  const { index, next, prev, isFullscreen } = useDeckController({
    total,
    channelName: `slides:${slug}`,
  });
  const [isPresenting, setIsPresenting] = useState(false);
  const isMaximized = isFullscreen || isPresenting;
  // oxlint-disable-next-line react/hook-use-state -- 初期化時に一度だけ算出する安定値で setter は不要
  const [sessionId] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    if (typeof crypto.randomUUID !== 'function') return '';
    const storageKey = `slide-session:${slug}`;
    const stored = window.sessionStorage.getItem(storageKey);
    if (stored !== null) return stored;
    const generated = crypto.randomUUID();
    window.sessionStorage.setItem(storageKey, generated);
    return generated;
  });
  useBroadcastViewerHeartbeat({ slug, sessionId });
  const current = slides[index] ?? slides[0];
  const presenterHref = `/slides/${slug}?mode=presenter&session=${encodeURIComponent(sessionId)}#${(index + 1).toString()}`;

  useEffect(() => {
    if (!isPresenting) return undefined;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPresenting(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [isPresenting]);

  return (
    <section
      aria-label={title}
      aria-roledescription="slide deck"
      className={styles.root}
    >
      {!isMaximized && (
        <header className={styles.header}>
          <div className={styles.titleRow}>
            <IconButton
              color="transparent"
              label="Slides一覧へ戻る"
              // next/link は onClick や ref に明示的な undefined を受けない
              // (exactOptionalPropertyTypes) ため、束は展開せず要るものだけ取り出す
              renderItem={({
                'aria-label': ariaLabel,
                className,
                children: itemChildren,
                triggerProps,
              }) => (
                <Link
                  aria-label={ariaLabel}
                  className={className}
                  href="/slides"
                  {...triggerProps}
                >
                  {itemChildren}
                </Link>
              )}
            >
              <CloseIcon />
            </IconButton>
            <p className={styles.title}>{title}</p>
          </div>
          <div className={styles.actions}>
            <p aria-live="polite" className={styles.counter}>
              {index + 1} <span className={styles.total}>/ {total}</span>
            </p>
            <button
              className={styles.action}
              onClick={() => {
                const opened = window.open(presenterHref, '_blank');
                if (opened === null) return;
                setIsPresenting(true);
              }}
              type="button"
            >
              発表者モード
            </button>
            <button
              className={styles.action}
              onClick={() => {
                window.print();
              }}
              type="button"
            >
              PDF出力
            </button>
          </div>
        </header>
      )}
      {!isMaximized && <ProgressBar current={index} total={total} />}
      <div className={styles.stage} data-maximized={isMaximized}>
        <Stage flush={isMaximized} key={index} qrUrl={qrUrl}>
          <BrowserOnly>{current?.content}</BrowserOnly>
        </Stage>
      </div>
      {isPresenting && (
        <div className={styles.exit}>
          <div className={styles.exitButton}>
            <IconButton
              color="base"
              label="発表者モードを終了"
              onClick={() => {
                setIsPresenting(false);
              }}
            >
              <CloseIcon />
            </IconButton>
          </div>
        </div>
      )}
      {!isMaximized && (
        <footer className={styles.footer}>
          <NavButton direction="prev" disabled={index === 0} onAction={prev} />
          <NavButton
            direction="next"
            disabled={index === total - 1}
            onAction={next}
          />
        </footer>
      )}
    </section>
  );
};
