import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { mocked } from 'storybook/test';
import { getBlogToc } from '@/app/blog/_api';
import { TableOfContext } from './table-of-context';

const meta: Meta<typeof TableOfContext> = {
  title: 'app/blog/blog-layout/table-of-context',
  component: TableOfContext,
  beforeEach: () => {
    mocked(getBlogToc).mockResolvedValue({
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
    });
  },
};

export default meta;
type Story = StoryObj<typeof TableOfContext>;

export const Primary: Story = {};
