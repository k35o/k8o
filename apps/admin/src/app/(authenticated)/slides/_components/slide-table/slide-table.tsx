'use client';

import { Badge, Card, Switch, useToast } from '@k8o/arte-odyssey';
import { type ChangeEvent, type FC, useState } from 'react';

import { EmptyState } from '@/app/(authenticated)/_components';
import { setSlidePublished } from '@/features/slides/interface/actions';
import type { SlideRecord } from '@/features/slides/interface/queries';
import { useAsyncAction } from '@/shared/hooks/use-async-action';

const SLIDE_BASE_URL = 'https://k8o.me/slides';

const SlideRow: FC<{ slide: SlideRecord }> = ({ slide }) => {
  const [published, setPublished] = useState(slide.published);
  const { isPending, run } = useAsyncAction();
  const { onOpen } = useToast();

  const handleToggle = (e: ChangeEvent<HTMLInputElement>): void => {
    const next = e.target.checked;
    setPublished(next);
    run(() => setSlidePublished(slide.id, next), {
      onError: (message) => {
        setPublished(!next);
        onOpen('error', message);
      },
      onSuccess: () => {
        onOpen('success', next ? '公開しました' : '下書きに戻しました');
      },
    });
  };

  return (
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
        <Switch
          disabled={isPending}
          label={published ? '公開' : '下書き'}
          onChange={handleToggle}
          value={published}
        />
      </div>
    </div>
  );
};

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
