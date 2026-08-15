import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { SlideCard } from './slide-card';

const meta = preview.meta({
  title: 'app/slides/slide-card',
  component: SlideCard,
});

export const Primary = meta.story({
  args: {
    slug: 'sample-deck',
    tags: ['React', 'TypeScript'],
    title: 'サンプルスライドデッキ',
    description: 'カードに表示される説明文のサンプルです。',
    createdAt: '2026-05-15T00:00:00.000Z',
    updatedAt: '2026-05-15T00:00:00.000Z',
  },
});

export const HasLinkToSlide = meta.story({
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
});
