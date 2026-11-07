import preview from '../../../../.storybook/preview';
import { TagCard } from './tag-card';

const meta = preview.meta({
  title: 'app/tags/tag-card',
  component: TagCard,
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
