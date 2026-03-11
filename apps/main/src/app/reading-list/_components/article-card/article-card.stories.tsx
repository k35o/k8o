import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { ArticleCard } from './article-card';

const meta: Meta<typeof ArticleCard> = {
  title: 'app/reading-list/article-card',
  component: ArticleCard,
};

export default meta;
type Story = StoryObj<typeof ArticleCard>;

export const Primary: Story = {
  args: {
    title: 'Interop 2025: a new year of web platform improvements',
    url: 'https://web.dev/blog/interop-2025',
    publishedAt: '2025-02-10T00:00:00Z',
    source: {
      title: 'web.dev',
      siteUrl: 'https://web.dev',
    },
  },
};

export const DisplaysTitle: Story = {
  args: {
    title: 'React 19のuseアクションについて',
    url: 'https://example.com/react-19-use',
    publishedAt: '2025-06-01T00:00:00Z',
    source: {
      title: 'Example Blog',
      siteUrl: 'https://example.com',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 記事タイトルが表示されていることを確認
    const link = canvas.getByRole('link', {
      name: /React 19のuseアクションについて/,
    });
    await expect(link).toBeInTheDocument();
    await expect(link).toHaveAttribute(
      'href',
      'https://example.com/react-19-use',
    );
  },
};

export const DisplaysSourceInfo: Story = {
  args: {
    title: 'テスト記事',
    url: 'https://zenn.dev/test',
    publishedAt: '2025-03-15T00:00:00Z',
    source: {
      title: 'Zenn',
      siteUrl: 'https://zenn.dev',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // ソース名が表示されていることを確認
    const sourceLink = canvas.getByRole('link', { name: 'Zenn' });
    await expect(sourceLink).toBeInTheDocument();
    await expect(sourceLink).toHaveAttribute('href', 'https://zenn.dev');
  },
};

export const DisplaysPublishedDate: Story = {
  args: {
    title: 'テスト記事',
    url: 'https://example.com/test',
    publishedAt: '2025-01-15T00:00:00Z',
    source: {
      title: 'Example',
      siteUrl: 'https://example.com',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 公開日が表示されていることを確認
    await expect(canvas.getByText('2025年1月15日(水)')).toBeInTheDocument();
  },
};

export const LongTitle: Story = {
  args: {
    title:
      'ものすごく長いタイトルの記事で表示が崩れないことを確認するためのストーリーです。Webフロントエンド開発における最新のベストプラクティスについて。',
    url: 'https://example.com/long-title',
    publishedAt: '2025-04-01T00:00:00Z',
    source: {
      title: 'とても長いサイト名のブログ',
      siteUrl: 'https://example.com',
    },
  },
};
