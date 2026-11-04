import { expect } from 'storybook/test';

import type { HeadingTree } from '@/shared/mdx/types';

import preview from '../../../../../.storybook/preview';
import { TableOfContents } from './table-of-contents';

const headingTree: HeadingTree = {
  depth: 0,
  children: [
    {
      depth: 1,
      text: 'タイトル1',
      children: [
        {
          depth: 2,
          text: 'タイトル1-1',
          children: [],
        },
        {
          depth: 2,
          text: 'タイトル1-2',
          children: [
            {
              depth: 3,
              text: 'タイトル1-2-1',
            },
            {
              depth: 3,
              text: 'タイトル1-2-2',
            },
          ],
        },
        {
          depth: 2,
          text: 'タイトル1-3',
          children: [],
        },
      ],
    },
    {
      depth: 1,
      text: 'タイトル2',
      children: [],
    },
    {
      depth: 1,
      text: 'タイトル3',
      children: [
        {
          depth: 2,
          text: 'タイトル3-1',
          children: [],
        },
      ],
    },
  ],
};

const meta = preview.meta({
  title: 'app/blog/blog-layout/table-of-contents',
  component: TableOfContents,
  args: { headingTree },
});

export const Primary = meta.story();

// 下に固定したもくじが、フォーカスした要素とページの最後のフッターを覆わない
export const ReservesSpaceBelow = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvasElement }) => {
    const toc = canvasElement.querySelector('details');
    if (toc === null) {
      throw new Error('もくじがありません');
    }
    const occupied = window.innerHeight - toc.getBoundingClientRect().top;

    await expect(
      Number.parseFloat(
        getComputedStyle(document.documentElement).scrollPaddingBottom,
      ),
    ).toBeGreaterThanOrEqual(occupied);
  },
});

// 見出しの無い記事ではもくじを出さないので、余白も取らない
export const NoHeadings = meta.story({
  args: { headingTree: { depth: 0, children: [] } },
  parameters: { vrt: { skip: true } },
  play: async () => {
    await expect(
      getComputedStyle(document.documentElement).scrollPaddingBottom,
    ).toBe('auto');
  },
});
