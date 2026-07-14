'use client';

import { useState } from 'react';
import type { FC } from 'react';

import type { Slide } from '@/features/slides/application/split-slides';

import { useDeckController } from '../hooks/use-deck-controller';
import { useClosePresenterOnViewerStop } from '../hooks/use-presenter-lifecycle';
import { NavButton } from '../nav-button';
import { Stage } from '../stage';

export const DeckPresenter: FC<{
  slug: string;
  title: string;
  slides: Slide[];
  qrUrl: string;
}> = ({ slug, title, slides, qrUrl }) => {
  const total = slides.length;
  const { index, next, prev, isHydrated } = useDeckController({
    total,
    channelName: `slides:${slug}`,
  });
  const current = slides[index] ?? slides[0];
  const nextSlide = slides[index + 1];
  const [sessionId] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('session') ?? '';
  });
  useClosePresenterOnViewerStop({ slug, sessionId });

  return (
    <section
      aria-label={`${title} - 発表者モード`}
      className="bg-bg-mute text-fg-base fixed inset-0 z-50 flex flex-col gap-2 p-4"
    >
      <header className="flex items-center justify-between gap-4">
        <p className="text-fg-base truncate text-sm font-bold">
          {title}{' '}
          <span className="text-fg-mute font-medium">- 発表者モード</span>
        </p>
        <p
          aria-live="polite"
          className="text-primary-fg text-sm font-medium tabular-nums"
        >
          {index + 1} <span className="text-fg-mute">/ {total}</span>
        </p>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[1fr_auto] gap-4 lg:grid-cols-[2fr_1fr] lg:grid-rows-[2fr_1fr]">
        <section
          aria-label="現在のスライド"
          className="flex min-h-0 min-w-0 flex-col gap-1 lg:row-span-2"
        >
          <p className="text-primary-fg text-xs font-medium tracking-wide uppercase">
            Now
          </p>
          <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
            <Stage key={`current-${index.toString()}`} qrUrl={qrUrl}>
              {isHydrated ? current?.content : null}
            </Stage>
          </div>
        </section>
        <section
          aria-label="次のスライド"
          className="flex min-h-0 min-w-0 flex-col gap-1"
        >
          <p className="text-fg-mute text-xs font-medium tracking-wide uppercase">
            Next
          </p>
          <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
            {nextSlide === undefined ? (
              <div className="bg-bg-base text-fg-mute flex h-full items-center justify-center rounded-lg text-sm">
                最終スライドです
              </div>
            ) : (
              <Stage key={`next-${index.toString()}`}>
                {isHydrated ? nextSlide.content : null}
              </Stage>
            )}
          </div>
        </section>
        <section
          aria-label="発表者ノート"
          className="bg-bg-base flex min-h-0 min-w-0 flex-col gap-2 overflow-auto rounded-lg p-4"
        >
          <p className="text-secondary-fg text-xs font-medium tracking-wide uppercase">
            Notes
          </p>
          <div className="text-fg-base text-sm leading-relaxed">
            {current === undefined || current.notes.length === 0 ? (
              <p className="text-fg-mute italic">ノートはありません</p>
            ) : (
              current.notes.map((note, i) => (
                <div key={i.toString()}>{note}</div>
              ))
            )}
          </div>
        </section>
      </div>
      <footer className="flex items-center justify-between gap-2">
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
