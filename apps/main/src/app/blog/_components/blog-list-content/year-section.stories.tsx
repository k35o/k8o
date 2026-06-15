import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { YearSection } from './year-section';

const meta: Meta<typeof YearSection> = {
  title: 'app/blog/year-section',
  component: YearSection,
  args: {
    year: 2024,
    blogs: [
      {
        id: 1,
        slug: 'first-post',
        tags: ['React'],
        title: '最初の記事',
        description: '最初の記事の説明',
        createdAt: '2024-03-01T00:00:00.000Z',
        updatedAt: '2024-03-10T00:00:00.000Z',
      },
      {
        id: 2,
        slug: 'second-post',
        tags: ['CSS'],
        title: '2番目の記事',
        description: null,
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-20T00:00:00.000Z',
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof YearSection>;

export const Primary: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { level: 3, name: '2024年' }),
    ).toBeInTheDocument();

    await expect(canvas.getByText('最初の記事')).toBeInTheDocument();
    await expect(canvas.getByText('2番目の記事')).toBeInTheDocument();
  },
};
