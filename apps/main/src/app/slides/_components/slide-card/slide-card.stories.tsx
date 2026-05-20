import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { SlideCard } from './slide-card';

const meta: Meta<typeof SlideCard> = {
  title: 'app/slides/slide-card',
  component: SlideCard,
};

export default meta;
type Story = StoryObj<typeof SlideCard>;

export const Primary: Story = {
  args: {
    slug: 'sample-deck',
    tags: ['React', 'TypeScript'],
    title: 'サンプルスライドデッキ',
    description: 'カードに表示される説明文のサンプルです。',
    createdAt: '2026-05-15T00:00:00.000Z',
    updatedAt: '2026-05-15T00:00:00.000Z',
  },
};

export const HasLinkToSlide: Story = {
  args: {
    slug: 'sample-deck',
    tags: [],
    title: 'リンクテスト',
    description: null,
    createdAt: '2026-05-15T00:00:00.000Z',
    updatedAt: '2026-05-15T00:00:00.000Z',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');
    await expect(link).toHaveAttribute('href', '/slides/sample-deck');
  },
};
