import { Stack } from '@k8ordo/ui';
import type { ComponentProps, FC } from 'react';

import { SlideCard } from '../slide-card/slide-card';

export const SlideIndex: FC<{
  slides: ReadonlyArray<ComponentProps<typeof SlideCard> & { id: number }>;
}> = ({ slides }) => (
  <Stack gap="md">
    {slides.map((slide) => (
      <SlideCard key={slide.id} {...slide} />
    ))}
  </Stack>
);
