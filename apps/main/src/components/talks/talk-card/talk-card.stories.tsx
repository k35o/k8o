import { expect, within } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { TalkCard } from './talk-card';

const meta = preview.meta({
  title: 'app/talks/talk-card',
  component: TalkCard,
});

export const Primary = meta.story({
  args: {
    title: 'Talk Title',
    eventUrl: 'https://example.com',
    eventName: 'Event Name',
    eventDate: '2023-01-01',
    eventLocation: 'Event Location',
    slidesHref: 'https://example.com/slides',
    cover: null,
    blog: {
      id: 1,
      slug: 'blog-slug',
    },
    tags: [
      { id: 1, name: 'Tag 1' },
      { id: 2, name: 'Tag 2' },
    ],
  },
});

export const DisplaysTitle = meta.story({
  args: {
    title: 'React 19の新機能について',
    eventUrl: 'https://example.com',
    eventName: 'React Meetup Tokyo',
    eventDate: '2024-03-15',
    eventLocation: '東京',
    slidesHref: 'https://example.com/slides',
    cover: null,
    blog: { id: 1, slug: 'react-19-features' },
    tags: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { name: /React 19の新機能について/u }),
    ).toBeInTheDocument();
  },
});

export const DisplaysEventInfo = meta.story({
  args: {
    title: 'テスト発表',
    eventUrl: 'https://example.com',
    eventName: 'Tech Conference 2024',
    eventDate: '2024-06-01',
    eventLocation: '大阪',
    slidesHref: 'https://example.com/slides',
    cover: null,
    blog: { id: 1, slug: 'test' },
    tags: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Tech Conference 2024')).toBeInTheDocument();

    await expect(canvas.getByText('大阪')).toBeInTheDocument();
  },
});

export const DisplaysTags = meta.story({
  args: {
    title: 'テスト発表',
    eventUrl: 'https://example.com',
    eventName: 'Event',
    eventDate: '2024-01-01',
    eventLocation: null,
    slidesHref: 'https://example.com/slides',
    cover: null,
    blog: { id: 1, slug: 'test' },
    tags: [
      { id: 1, name: 'React' },
      { id: 2, name: 'TypeScript' },
      { id: 3, name: 'Next.js' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('React')).toBeInTheDocument();
    await expect(canvas.getByText('TypeScript')).toBeInTheDocument();
    await expect(canvas.getByText('Next.js')).toBeInTheDocument();
  },
});

export const HasSlideLink = meta.story({
  args: {
    title: 'テスト発表',
    eventUrl: 'https://example.com',
    eventName: 'Event',
    eventDate: '2024-01-01',
    eventLocation: null,
    slidesHref: 'https://slides.example.com/my-slides',
    cover: null,
    blog: { id: 1, slug: 'test' },
    tags: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const slideLink = canvas.getByRole('link', { name: 'テスト発表' });
    await expect(slideLink).toHaveAttribute(
      'href',
      'https://slides.example.com/my-slides',
    );
    await expect(slideLink).toHaveAttribute('target', '_blank');
  },
});

export const HasBlogLink = meta.story({
  args: {
    title: 'テスト発表',
    eventUrl: 'https://example.com',
    eventName: 'Event',
    eventDate: '2024-01-01',
    eventLocation: null,
    slidesHref: 'https://example.com/slides',
    cover: null,
    blog: { id: 1, slug: 'my-blog-post' },
    tags: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const blogLink = canvas.getByRole('link', { name: 'ブログで解説を読む' });
    await expect(blogLink).toBeInTheDocument();
    await expect(blogLink).toHaveAttribute('href', '/blog/my-blog-post');
  },
});

// 正常系: タグはタグのページへのリンクで、Tab はタグ 1 つに 1 回だけ止まる
export const TagLinks = DisplaysTags.extend({
  play: async ({ canvas, userEvent }) => {
    const react = canvas.getByRole('link', { name: 'React' });
    await expect(react).toHaveAttribute('href', '/tags/1');

    react.focus();
    await userEvent.tab();
    await expect(
      canvas.getByRole('link', { name: 'TypeScript' }),
    ).toHaveFocus();
  },
});

export const DeckOnSite = meta.story({
  args: {
    title: 'テスト発表',
    eventUrl: 'https://example.com',
    eventName: 'Event',
    eventDate: '2024-01-01',
    eventLocation: null,
    slidesHref: '/talks/my-talk',
    cover: null,
    blog: { id: 1, slug: 'test' },
    tags: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const slideLink = canvas.getByRole('link', { name: 'テスト発表' });
    await expect(slideLink).toHaveAttribute('href', '/talks/my-talk');
    await expect(slideLink).not.toHaveAttribute('target');
  },
});

export const WithoutSlidesAndBlog = meta.story({
  args: {
    title: 'テスト発表',
    eventUrl: 'https://example.com',
    eventName: 'Event',
    eventDate: '2024-01-01',
    eventLocation: null,
    slidesHref: null,
    cover: null,
    blog: null,
    tags: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByRole('link', { name: 'テスト発表' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('link', { name: 'ブログで解説を読む' }),
    ).not.toBeInTheDocument();
  },
});

const coverSvg = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"><rect width="1920" height="1080" fill="#0f766e"/></svg>',
);

// 正常系: 表紙はタイトルと同じ行き先で、読み上げと Tab からは外れ、デッキへのリンクはタイトルの 1 つだけになる
export const WithCover = meta.story({
  args: {
    title: 'テスト発表',
    eventUrl: 'https://example.com',
    eventName: 'Event',
    eventDate: '2024-01-01',
    eventLocation: null,
    slidesHref: '/talks/my-talk',
    cover: {
      src: `data:image/svg+xml,${coverSvg}`,
      srcSet: `data:image/svg+xml,${coverSvg} 1920w`,
      width: 1920,
      height: 1080,
    },
    blog: { id: 1, slug: 'test' },
    tags: [],
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(
      canvas.getAllByRole('link', { name: 'テスト発表' }),
    ).toHaveLength(1);
    const cover = canvasElement.querySelector('a[aria-hidden="true"]');
    await expect(cover).toHaveAttribute('href', '/talks/my-talk');

    await userEvent.tab();
    await expect(
      canvas.getByRole('link', { name: 'テスト発表' }),
    ).toHaveFocus();
  },
});
