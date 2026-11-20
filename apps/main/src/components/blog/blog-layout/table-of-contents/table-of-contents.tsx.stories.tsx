import { expect } from 'storybook/test';

import { Dock } from '@/components/site/global-layout/dock/dock';
import type { HeadingTree } from '@/features/blog/interface/queries';

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
  // 行き先とページの項目が並ぶのは狭い幅のドック
  globals: { viewport: { value: 'mobile1' } },
  args: { headingTree },
  decorators: [
    (Story) => (
      <>
        <Dock />
        <Story />
      </>
    ),
  ],
});

export const Primary = meta.story({
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole('button', { name: /もくじ/ }),
    );
    await expect(
      await canvas.findByRole('navigation', { name: 'もくじ' }),
    ).toBeVisible();
  },
});

// 見出しを選ぶと、パネルを閉じてドックを元に戻す
export const ClosesOnNavigate = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvas, userEvent }) => {
    const trigger = await canvas.findByRole('button', { name: /もくじ/ });
    await userEvent.click(trigger);
    const [link] = await canvas.findAllByRole('link', { name: /タイトル/ });
    if (link === undefined) {
      throw new Error('見出しのリンクがありません');
    }
    // vitest のブラウザの殻は <base target="_parent"> を置き、リンクが親の枠を移して試験が切れる
    link.setAttribute('target', '_self');
    await userEvent.click(link);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
});

// 見出しの無い記事では、ドックにもくじを足さない
export const NoHeadings = meta.story({
  args: { headingTree: { depth: 0, children: [] } },
  parameters: { vrt: { skip: true } },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('navigation', { name: 'メイン' }),
    ).toBeVisible();
    await expect(canvas.queryByRole('button', { name: /もくじ/ })).toBeNull();
  },
});
