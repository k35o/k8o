import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { WritingModeProvider } from '../writing-mode';
import { TableOfContentsSideRail } from './side-rail';

const meta: Meta<typeof TableOfContentsSideRail> = {
  title: 'app/blog/blog-layout/table-of-contents-side-rail',
  component: TableOfContentsSideRail,
  decorators: [
    (Story) => (
      <WritingModeProvider>
        <Story />
      </WritingModeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TableOfContentsSideRail>;

export const Primary: Story = {
  args: {
    headingTree: {
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
    },
  },
};
