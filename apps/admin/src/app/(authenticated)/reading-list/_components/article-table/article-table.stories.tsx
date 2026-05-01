import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { ArticleTable } from './article-table';

const meta: Meta<typeof ArticleTable> = {
  title: 'admin/reading-list/article-table',
  component: ArticleTable,
};

export default meta;
type Story = StoryObj<typeof ArticleTable>;

export const Primary: Story = {
  args: {
    articles: [
      {
        id: 1,
        title: 'Interop 2025: a new year of web platform improvements',
        url: 'https://web.dev/blog/interop-2025',
        publishedAt: '2025-02-10T00:00:00Z',
        sourceName: 'web.dev',
      },
      {
        id: 2,
        title: 'React 19のuseアクションについて',
        url: 'https://zenn.dev/react-19-use',
        publishedAt: '2025-06-01T00:00:00Z',
        sourceName: 'Zenn',
      },
      {
        id: 3,
        title: 'CSS Anchoring APIの使い方',
        url: 'https://example.com/css-anchoring',
        publishedAt: '2025-05-20T00:00:00Z',
        sourceName: 'Example Blog',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('Interop 2025: a new year of web platform improvements'),
    ).toBeInTheDocument();
    await expect(canvas.getByText('web.dev')).toBeInTheDocument();
    await expect(canvas.getByText('Zenn')).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: {
    articles: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('取得済みの記事はありません'),
    ).toBeInTheDocument();
  },
};
