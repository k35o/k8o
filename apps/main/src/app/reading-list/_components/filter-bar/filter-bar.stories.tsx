import type { ComponentProps } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import type { SortOrder } from '../../_utils/constants';
import { FilterBar } from './filter-bar';

const meta = preview.meta({
  title: 'app/reading-list/filter-bar',
  component: FilterBar,
  // propより狭い型（unionリテラル・[]）のままargsを推論させるとmeta.storyの
  // 型推論が壊れるため、satisfiesで文脈型を与えて広げる。関数は文脈型で
  // 広がらないため、引数まで書いてpropのシグネチャに一致させる
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
    onQueryChange: (_value: string) => {},
    onSortChange: (_value: SortOrder) => {},
    onSourceChange: (_ids: number[]) => {},
  } satisfies Partial<ComponentProps<typeof FilterBar>>,
});

export const Primary = meta.story({
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
});

// 正常系: 選択済みソースが削除可能なチップとして表示される
export const WithSelectedSources = meta.story({
  args: {
    sourceIds: [1, 3],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('web.dev (24)')).toBeInTheDocument();
    await expect(canvas.getByText('Chrome Developers (8)')).toBeInTheDocument();
  },
});

// 正常系: 入力して候補から選ぶと、その id が onSourceChange に渡る
export const SelectByTyping = meta.story({
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
});
