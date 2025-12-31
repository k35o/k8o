import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { TalkCard } from './talk-card';

const meta: Meta<typeof TalkCard> = {
  title: 'app/talks/talk-card',
  component: TalkCard,
};

export default meta;
type Story = StoryObj<typeof TalkCard>;

export const Primary: Story = {
  args: {
    title: 'Talk Title',
    eventUrl: 'https://example.com',
    eventName: 'Event Name',
    eventDate: '2023-01-01',
    eventLocation: 'Event Location',
    slideUrl: 'https://example.com/slides',
    blog: {
      id: 1,
      slug: 'blog-slug',
    },
    tags: [
      { id: 1, name: 'Tag 1' },
      { id: 2, name: 'Tag 2' },
    ],
  },
};

export const DisplaysTitle: Story = {
  args: {
    title: 'React 19の新機能について',
    eventUrl: 'https://example.com',
    eventName: 'React Meetup Tokyo',
    eventDate: '2024-03-15',
    eventLocation: '東京',
    slideUrl: 'https://example.com/slides',
    blog: { id: 1, slug: 'react-19-features' },
    tags: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // タイトルが表示されていることを確認
    await expect(
      canvas.getByRole('heading', { name: /React 19の新機能について/ }),
    ).toBeInTheDocument();
  },
};

export const DisplaysEventInfo: Story = {
  args: {
    title: 'テスト発表',
    eventUrl: 'https://example.com',
    eventName: 'Tech Conference 2024',
    eventDate: '2024-06-01',
    eventLocation: '大阪',
    slideUrl: 'https://example.com/slides',
    blog: { id: 1, slug: 'test' },
    tags: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // イベント名が表示されていることを確認
    await expect(canvas.getByText('Tech Conference 2024')).toBeInTheDocument();

    // 場所が表示されていることを確認
    await expect(canvas.getByText('大阪')).toBeInTheDocument();
  },
};

export const DisplaysTags: Story = {
  args: {
    title: 'テスト発表',
    eventUrl: 'https://example.com',
    eventName: 'Event',
    eventDate: '2024-01-01',
    eventLocation: null,
    slideUrl: 'https://example.com/slides',
    blog: { id: 1, slug: 'test' },
    tags: [
      { id: 1, name: 'React' },
      { id: 2, name: 'TypeScript' },
      { id: 3, name: 'Next.js' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // タグが表示されていることを確認
    await expect(canvas.getByText('React')).toBeInTheDocument();
    await expect(canvas.getByText('TypeScript')).toBeInTheDocument();
    await expect(canvas.getByText('Next.js')).toBeInTheDocument();
  },
};

export const HasSlideLink: Story = {
  args: {
    title: 'テスト発表',
    eventUrl: 'https://example.com',
    eventName: 'Event',
    eventDate: '2024-01-01',
    eventLocation: null,
    slideUrl: 'https://slides.example.com/my-slides',
    blog: { id: 1, slug: 'test' },
    tags: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // スライドリンクが存在することを確認
    const slideLink = canvas.getByRole('link', { name: 'スライドを見る' });
    await expect(slideLink).toBeInTheDocument();
    await expect(slideLink).toHaveAttribute(
      'href',
      'https://slides.example.com/my-slides',
    );
  },
};

export const HasBlogLink: Story = {
  args: {
    title: 'テスト発表',
    eventUrl: 'https://example.com',
    eventName: 'Event',
    eventDate: '2024-01-01',
    eventLocation: null,
    slideUrl: 'https://example.com/slides',
    blog: { id: 1, slug: 'my-blog-post' },
    tags: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // ブログリンクが存在することを確認
    const blogLink = canvas.getByRole('link', { name: 'ブログで解説を読む' });
    await expect(blogLink).toBeInTheDocument();
    await expect(blogLink).toHaveAttribute('href', '/blog/my-blog-post');
  },
};
