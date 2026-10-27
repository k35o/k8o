import { expect } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { Home } from './home';

const meta = preview.meta({
  title: 'app/globals/home',
  component: Home,
  args: {
    blogs: [
      {
        id: 12,
        slug: 'scroll-state-queries',
        title: 'スクロールの状態で見た目を変えるscroll-state()',
        description:
          'scroll-stateコンテナクエリで、スクロールの位置や張り付きに応じてスタイルを切り替えます。',
        tags: ['CSS', 'Container Queries'],
        createdAt: '2025-05-02T09:12:00.000Z',
        updatedAt: '2025-05-03T01:00:00.000Z',
        readingTime: 7,
      },
      {
        id: 11,
        slug: 'atomics-pause',
        title: 'Atomicsで共有メモリ上のデータを安全に取り扱う',
        description: null,
        tags: ['JavaScript'],
        createdAt: '2025-04-13T02:50:57.000Z',
        updatedAt: '2025-04-13T02:50:57.000Z',
        readingTime: 8,
      },
      {
        id: 10,
        slug: 'async-clipboard',
        title: '任意のデータをコピー&ペーストするClipboard API',
        description: 'Clipboard APIで画像やHTMLをコピーする方法。',
        tags: [],
        createdAt: '2025-04-06T10:02:57.807Z',
        updatedAt: '2025-04-06T10:02:57.807Z',
        readingTime: 6,
      },
      {
        id: 9,
        slug: 'screen-wake-lock',
        title: '画面のスリープを防ぐScreen Wake Lock API',
        description: null,
        tags: ['JavaScript'],
        createdAt: '2025-04-04T13:43:04.139Z',
        updatedAt: '2025-04-04T13:43:04.139Z',
        readingTime: 5,
      },
    ],
  },
});

export const Primary = meta.story();

export const ShowsNewestThreeBlogs = meta.story({
  play: async ({ canvas }) => {
    const articleLinks = canvas
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'))
      .filter((href) => href?.startsWith('/blog/'));
    await expect(articleLinks).toStrictEqual([
      '/blog/scroll-state-queries',
      '/blog/atomics-pause',
      '/blog/async-clipboard',
    ]);
  },
});
