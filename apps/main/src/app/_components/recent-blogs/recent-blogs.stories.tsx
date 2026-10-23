import { expect } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { RecentBlogs } from './recent-blogs';

const meta = preview.meta({
  title: 'app/globals/recent-blogs',
  component: RecentBlogs,
});

export const Primary = meta.story({
  args: {
    blogs: [
      {
        id: 11,
        slug: 'atomics-pause',
        title: 'Atomicsで共有メモリ上のデータを安全に取り扱う',
        description:
          'Atomics.pauseを中心に、共有メモリを複数のスレッドから安全に扱う方法を紹介します。',
        tags: ['JavaScript', 'Baseline 2025'],
        createdAt: '2025-04-13T02:50:57.000Z',
        updatedAt: '2025-04-13T02:50:57.000Z',
        readingTime: 8,
      },
      {
        id: 10,
        slug: 'async-clipboard',
        title: '任意のデータをコピー&ペーストするClipboard API',
        description: null,
        tags: ['JavaScript', 'Clipboard API'],
        createdAt: '2025-04-06T10:02:57.807Z',
        updatedAt: '2025-04-06T10:02:57.807Z',
        readingTime: 6,
      },
      {
        id: 9,
        slug: 'screen-wake-lock',
        title: '画面のスリープを防ぐScreen Wake Lock API',
        description: '画面を点けたままにするScreen Wake Lock APIの使い方。',
        tags: [],
        createdAt: '2025-04-04T13:43:04.139Z',
        updatedAt: '2025-04-04T13:43:04.139Z',
        readingTime: 5,
      },
    ],
  },
  play: async ({ canvas }) => {
    const links = canvas.getAllByRole('link');
    await expect(links.map((link) => link.getAttribute('href'))).toStrictEqual([
      '/blog/atomics-pause',
      '/blog/async-clipboard',
      '/blog/screen-wake-lock',
    ]);
  },
});
