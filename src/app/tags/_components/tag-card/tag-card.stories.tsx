import { TagCard } from './tag-card';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof TagCard> = {
  title: 'app/tags/tag-card',
  component: TagCard,
};

export default meta;
type Story = StoryObj<typeof TagCard>;

export const Primary: Story = {
  args: {
    id: 1,
    name: 'k8o',
    count: 10,
  },
};
