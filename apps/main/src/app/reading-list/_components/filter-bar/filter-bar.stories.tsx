import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { FilterBar } from './filter-bar';

const noop = () => {};

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
    sortOrder: 'newest',
    sourceIds: [],
    onQueryChange: noop,
    onSortChange: noop,
    onSourceChange: noop,
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
    await expect(
      canvas.getByRole('combobox', { name: '並び順' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('combobox', { name: 'ソース' }),
    ).toBeInTheDocument();
  },
};

// 正常系: 選択済みソースが削除可能なチップとして表示される
export const WithSelectedSources: Story = {
  args: {
    sourceIds: [1, 3],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('web.dev (24)')).toBeInTheDocument();
    await expect(canvas.getByText('Chrome Developers (8)')).toBeInTheDocument();
  },
};

// 正常系: 入力して候補から選ぶと、その id が onSourceChange に渡る
export const SelectByTyping: Story = {
  args: {
    onSourceChange: fn<(ids: number[]) => void>(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const combobox = canvas.getByRole('combobox', { name: 'ソース' });
    await userEvent.click(combobox);
    await userEvent.type(combobox, 'Zenn');
    const option = await canvas.findByRole('option', { name: 'Zenn (15)' });
    await userEvent.click(option);
    await expect(args.onSourceChange).toHaveBeenCalledWith([2]);
  },
};
