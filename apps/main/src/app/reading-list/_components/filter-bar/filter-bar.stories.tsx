import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';

import { FilterBar } from './filter-bar';

const meta: Meta<typeof FilterBar> = {
  title: 'app/reading-list/filter-bar',
  component: FilterBar,
  args: {
    sources: [
      { id: 1, title: 'web.dev', articleCount: 24 },
      { id: 2, title: 'Zenn', articleCount: 15 },
      { id: 3, title: 'Chrome Developers', articleCount: 8 },
      { id: 4, title: 'MDN Web Docs', articleCount: 12 },
      { id: 5, title: 'CSS Tricks', articleCount: 6 },
    ],
    query: '',
    dateRange: 'all',
    sortOrder: 'newest',
    sourceIds: [],
    onQueryChange: fn(),
    onDateChange: fn(),
    onSortChange: fn(),
    onSourceToggle: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof FilterBar>;

export const Primary: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('textbox', { name: '検索' }),
    ).toBeInTheDocument();
    await expect(canvas.getByText('ソース')).toBeInTheDocument();
    await expect(
      canvas.getByRole('combobox', { name: '期間' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('combobox', { name: '並び順' }),
    ).toBeInTheDocument();
  },
};
