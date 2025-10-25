import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { mocked } from 'storybook/test';
import { getBlogsByTags } from '@/app/blog/_api';
import { Recommend } from './recommend';

const meta: Meta<typeof Recommend> = {
  title: 'app/blog/blog-layout/recommend',
  component: Recommend,
  beforeEach: () => {
    mocked(getBlogsByTags).mockResolvedValue([
      {
        id: 11,
        slug: 'atomics-pause',
        title: 'Atomicsで共有メモリ上のデータを安全に取り扱う',
        createdAt: new Date('2025-04-13 02:50:57+00'),
        tags: ['JavaScript', 'Baseline 2025', 'Atomics', 'Atomics.pause'],
      },
      {
        id: 9,
        slug: 'screen-wake-lock',
        title: '画面のスリープを防ぐScreen Wake Lock API',
        createdAt: new Date('2025-04-04 13:43:04.13969+00'),
        tags: ['JavaScript', 'Baseline 2025', 'Screen Wake Lock'],
      },
      {
        id: 10,
        slug: 'async-clipboard',
        title: '任意のデータをコピー&ペーストするClipboard API',
        createdAt: new Date('2025-04-06 10:02:57.807659+00'),
        tags: [
          'JavaScript',
          'Baseline 2025',
          'Clipboard API',
          'ClipboardItem',
          'ClipboardItem supports',
        ],
      },
    ]);
  },
};

export default meta;
type Story = StoryObj<typeof Recommend>;

export const Primary: Story = {
  args: {
    slug: 'tanstack-router-introduction',
  },
};
