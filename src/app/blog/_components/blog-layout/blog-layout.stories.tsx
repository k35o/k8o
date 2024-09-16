import type { Meta, StoryObj } from '@storybook/react';
import { BlogLayout } from './blog-layout';

const meta: Meta<typeof BlogLayout> = {
  title: 'app/blog/blog-layout',
  component: BlogLayout,
};

export default meta;
type Story = StoryObj<typeof BlogLayout>;

export const Primary: Story = {
  args: {
    updatedAt: '2024/02/12',
    viewCount: 100,
    children: 'This is a blog layout',
  },
};
