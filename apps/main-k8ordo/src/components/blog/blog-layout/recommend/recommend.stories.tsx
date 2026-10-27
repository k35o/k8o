import { expect } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { Recommend } from './recommend';

const meta = preview.meta({
  title: 'app/blog/blog-layout/recommend',
  component: Recommend,
});

export const Primary = meta.story({
  args: {
    blogs: [
      {
        id: 11,
        slug: 'atomics-pause',
        title: 'Atomicsで共有メモリ上のデータを安全に取り扱う',
        createdAt: '2025-04-13T02:50:57.000Z',
        tags: ['JavaScript', 'Baseline 2025', 'Atomics', 'Atomics.pause'],
      },
      {
        id: 9,
        slug: 'screen-wake-lock',
        title: '画面のスリープを防ぐScreen Wake Lock API',
        createdAt: '2025-04-04T13:43:04.139Z',
        tags: ['JavaScript', 'Baseline 2025', 'Screen Wake Lock'],
      },
      {
        id: 10,
        slug: 'async-clipboard',
        title: '任意のデータをコピー&ペーストするClipboard API',
        createdAt: '2025-04-06T10:02:57.807Z',
        tags: [
          'JavaScript',
          'Baseline 2025',
          'Clipboard API',
          'ClipboardItem',
          'ClipboardItem supports',
        ],
      },
    ],
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { name: '関連記事' }),
    ).toBeInTheDocument();
    const links = canvas.getAllByRole('link');
    await expect(links.map((link) => link.getAttribute('href'))).toStrictEqual([
      '/blog/atomics-pause',
      '/blog/screen-wake-lock',
      '/blog/async-clipboard',
    ]);
  },
});

export const Empty = meta.story({
  args: { blogs: [] },
  play: async ({ canvas }) => {
    await expect(
      canvas.queryByRole('heading', { name: '関連記事' }),
    ).not.toBeInTheDocument();
  },
});
