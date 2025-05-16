import { TagContent } from './tag-content';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof TagContent> = {
  title: 'app/tags/tag-content',
  component: TagContent,
};

export default meta;
type Story = StoryObj<typeof TagContent>;

export const Primary: Story = {
  args: {
    name: 'k8o',
    blogs: [
      {
        id: 1,
        slug: 'k8o',
        title: 'k8o',
      },
    ],
    services: [
      {
        id: 1,
        slug: 'k8o',
        title: 'k8o',
      },
    ],
  },
};
