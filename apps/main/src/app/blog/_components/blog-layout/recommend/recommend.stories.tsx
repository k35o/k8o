import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { RecommendContent } from './recommend';

const meta: Meta<typeof RecommendContent> = {
  title: 'app/blog/blog-layout/recommend',
  component: RecommendContent,
};

export default meta;
type Story = StoryObj<typeof RecommendContent>;

export const Primary: Story = {
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
};
