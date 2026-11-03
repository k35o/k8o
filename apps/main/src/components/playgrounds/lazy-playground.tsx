import type { Playground } from '@playgrounds/playground';
import type { ComponentProps, FC } from 'react';

// 記事の部品の表は記事のページが静的に読むので、静的に import すると Playground の枠の CSS をデモの無い記事も読む
export const LazyPlayground: FC<ComponentProps<typeof Playground>> = async (
  props,
) => {
  const { Playground: Frame } = await import('@playgrounds/playground');
  return <Frame {...props} />;
};
