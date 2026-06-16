'use client';

import { Badge, Card } from '@k8o/arte-odyssey';
import type { FC } from 'react';

import { EmptyState, PublishToggle } from '@/app/(authenticated)/_components';
import { setSlidePublished } from '@/features/slides/interface/actions';
import type { SlideRecord } from '@/features/slides/interface/queries';

const SLIDE_BASE_URL = 'https://k8o.me/slides';

const SlideRow: FC<{ slide: SlideRecord }> = ({ slide }) => (
  <div className="border-border-mute flex items-center gap-3 border-b px-5 py-4 text-sm last:border-b-0">
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <a
        className="truncate font-medium hover:underline"
        href={`${SLIDE_BASE_URL}/${slide.slug}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        {slide.slug}
      </a>
      {slide.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {slide.tags.map((tag) => (
            <Badge key={tag} size="sm" text={tag} tone="neutral" />
          ))}
        </div>
      )}
    </div>
    <div className="flex w-24 shrink-0 justify-end">
      <PublishToggle
        initialPublished={slide.published}
        onToggle={(next) => setSlidePublished(slide.id, next)}
      />
    </div>
  </div>
);

export const SlideTable: FC<{ slides: SlideRecord[] }> = ({ slides }) => {
  if (slides.length === 0) {
    return <EmptyState message="スライドがありません" />;
  }

  return (
    <Card appearance="shadow">
      {slides.map((slide) => (
        <SlideRow key={slide.id} slide={slide} />
      ))}
    </Card>
  );
};
