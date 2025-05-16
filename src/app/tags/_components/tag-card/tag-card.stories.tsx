import { TagCard } from './tag-card';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof TagCard> = {
  title: 'app/tags/tag-card',
  component: TagCard,
};

export default meta;
type Story = StoryObj<typeof TagCard>;

export const Primary: Story = {
  args: {
    title: 'k8o',
    count: 10,
    href: '/tags',
    label: 'コンテンツを見る',
    linkLabel: '「k8o」に関連するコンテンツを表示する',
  },
};

export const NoCount: Story = {
  args: {
    title: 'k8o',
    href: '/tags',
    label: 'コンテンツを見る',
    linkLabel: '「k8o」に関連するコンテンツを表示する',
  },
};
