import { expect, within } from 'storybook/test';

import preview from '../../../../../../.storybook/preview';
import { SourceList } from './source-list';

const meta = preview.meta({
  title: 'admin/reading-list/source-list',
  component: SourceList,
});

export const Primary = meta.story({
  args: {
    sources: [
      {
        id: 1,
        title: 'web.dev',
        url: 'https://web.dev/feed.xml',
        siteUrl: 'https://web.dev',
        type: 'feed',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-06-01T00:00:00Z',
      },
      {
        id: 2,
        title: 'Zenn',
        url: 'https://zenn.dev/feed',
        siteUrl: 'https://zenn.dev',
        type: 'feed',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-05-15T00:00:00Z',
      },
      {
        id: 3,
        title: '手動登録',
        url: 'https://example.com/rss',
        siteUrl: 'https://example.com',
        type: 'manual',
        createdAt: '2025-02-01T00:00:00Z',
        updatedAt: '2025-04-01T00:00:00Z',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('web.dev')).toBeInTheDocument();
    await expect(canvas.getByText('Zenn')).toBeInTheDocument();
    await expect(canvas.getByText('手動登録')).toBeInTheDocument();
  },
});

export const Empty = meta.story({
  args: {
    sources: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('ソースがまだ登録されていません'),
    ).toBeInTheDocument();
  },
});
