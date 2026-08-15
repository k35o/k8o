import type { FC } from 'react';

import preview from '../../../../../.storybook/preview';
import { TagCard } from './tag-card';

const meta = preview.meta({
  title: 'app/tags/tag-card',
  // hrefのRoute unionはmeta.storyの型計算で "union type too complex" になるため、
  // stringに広げた型で渡す
  component: TagCard as FC<{
    title: string;
    href: string;
    count?: number | undefined;
    label: string;
    linkLabel: string;
  }>,
});

export const Primary = meta.story({
  args: {
    title: 'k8o',
    count: 10,
    href: '/tags',
    label: 'コンテンツを見る',
    linkLabel: '「k8o」に関連するコンテンツを表示する',
  },
});

export const NoCount = meta.story({
  args: {
    title: 'k8o',
    href: '/tags',
    label: 'コンテンツを見る',
    linkLabel: '「k8o」に関連するコンテンツを表示する',
  },
});
