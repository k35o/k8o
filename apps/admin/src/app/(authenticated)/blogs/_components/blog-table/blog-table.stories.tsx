import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { BlogTable } from './blog-table';

const meta: Meta<typeof BlogTable> = {
  title: 'admin/blogs/blog-table',
  component: BlogTable,
};

export default meta;
type Story = StoryObj<typeof BlogTable>;

export const Primary: Story = {
  args: {
    blogs: [
      {
        id: 1,
        slug: 'react-19-use',
        published: true,
        createdAt: '2025-01-01T00:00:00Z',
        views: 12_345,
        commentCount: 3,
        tags: ['React', 'Next.js'],
      },
      {
        id: 2,
        slug: 'css-anchor-positioning',
        published: false,
        createdAt: '2025-02-01T00:00:00Z',
        views: 56,
        commentCount: 0,
        tags: ['CSS'],
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('react-19-use')).toBeInTheDocument();
    await expect(canvas.getByText('12,345')).toBeInTheDocument();
    await expect(canvas.getAllByRole('switch').length).toBe(2);
  },
};

export const Empty: Story = {
  args: {
    blogs: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('条件に一致する記事はありません'),
    ).toBeInTheDocument();
  },
};
