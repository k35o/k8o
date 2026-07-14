'use client';

import { CloseIcon, IconButton } from '@k8o/arte-odyssey';
import { cn } from '@repo/helpers/cn';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { FC } from 'react';

import type { Slide } from '@/features/slides/application/split-slides';

import { useDeckController } from '../hooks/use-deck-controller';
import { useBroadcastViewerHeartbeat } from '../hooks/use-presenter-lifecycle';
import { NavButton } from '../nav-button';
import { ProgressBar } from '../progress-bar';
import { Stage } from '../stage';

export const DeckViewer: FC<{
  slug: string;
  title: string;
  slides: Slide[];
  qrUrl: string;
}> = ({ slug, title, slides, qrUrl }) => {
  const total = slides.length;
  const { index, next, prev, isFullscreen, isHydrated } = useDeckController({
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
      className="bg-bg-mute text-fg-base fixed inset-0 z-50 flex flex-col"
    >
      {!isMaximized && (
        <header className="flex items-center justify-between gap-4 px-4 py-2">
          <div className="flex items-center gap-2">
            <IconButton
              color="transparent"
              label="Slides一覧へ戻る"
              renderItem={({
                className,
                children: itemChildren,
                'aria-label': ariaLabel,
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
            <p className="text-fg-base truncate text-sm font-bold">{title}</p>
          </div>
          <div className="flex items-center gap-3">
            <p
              aria-live="polite"
              className="text-primary-fg text-sm font-medium tabular-nums"
            >
              {index + 1} <span className="text-fg-mute">/ {total}</span>
            </p>
            <button
              className="text-fg-mute hover:text-primary-fg cursor-pointer text-sm underline"
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
              className="text-fg-mute hover:text-primary-fg cursor-pointer text-sm underline"
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
      <div
        className={cn('min-h-0 flex-1', isMaximized ? null : 'px-4 pt-2 pb-4')}
      >
        <Stage flush={isMaximized} key={index} qrUrl={qrUrl}>
          {isHydrated ? current?.content : null}
        </Stage>
      </div>
      {isPresenting && (
        <div className="pointer-events-none absolute top-2 right-2 z-10">
          <div className="pointer-events-auto">
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
        <footer className="flex items-center justify-between gap-2 px-4 py-2">
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
