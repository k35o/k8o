import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { FilterBar } from './filter-bar';

const meta: Meta<typeof FilterBar> = {
  title: 'app/reading-list/filter-bar',
  component: FilterBar,
  args: {
    sources: [
      { id: 1, title: 'web.dev' },
      { id: 2, title: 'Zenn' },
      { id: 3, title: 'Chrome Developers' },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof FilterBar>;

export const Primary: Story = {};

export const SearchByName: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const searchField = canvas.getByRole('textbox', { name: '名前検索' });
    await userEvent.type(searchField, 'React');
    await expect(searchField).toHaveValue('React');
  },
};

export const SelectSource: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const sourceSelect = canvas.getByRole('combobox', { name: 'ソース' });
    await userEvent.selectOptions(sourceSelect, '1');
    await expect(sourceSelect).toHaveValue('1');
  },
};
